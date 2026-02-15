import type { UserRole } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import { env } from '../config/env.js';
import { prisma } from '../infrastructure/db.js';
import { ApiError } from '../utils/ApiError.js';

const SALT_ROUNDS = 10;
const RESET_TOKEN_EXPIRY_HOURS = 1;

export interface GoogleTokenPayload {
  email: string;
  name: string;
  picture?: string;
  sub: string; // Google user id
}

export interface FacebookTokenPayload {
  id: string;
  email?: string;
  name?: string;
  picture?: { data?: { url?: string } };
}

async function verifyGoogleToken(idToken: string): Promise<GoogleTokenPayload> {
  const res = await axios.get(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
    { timeout: 5000 }
  ).catch(() => null);
  if (!res?.data?.email) {
    throw new ApiError('Invalid Google token', 401, 'INVALID_OAUTH_TOKEN');
  }
  return {
    email: res.data.email,
    name: res.data.name ?? res.data.email,
    picture: res.data.picture,
    sub: res.data.sub,
  };
}

async function verifyFacebookToken(accessToken: string): Promise<FacebookTokenPayload> {
  if (!env.FACEBOOK_APP_ID || !env.FACEBOOK_APP_SECRET) {
    throw new ApiError('Facebook OAuth not configured', 503, 'OAUTH_NOT_CONFIGURED');
  }
  const res = await axios.get(
    `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture`,
    { timeout: 5000 }
  ).catch(() => null);
  if (!res?.data?.id) {
    throw new ApiError('Invalid Facebook token', 401, 'INVALID_OAUTH_TOKEN');
  }
  return {
    id: res.data.id,
    email: res.data.email,
    name: res.data.name,
    picture: res.data.picture,
  };
}

function issueJwt(userId: string, email: string, role: string): string {
  return jwt.sign(
    { userId, email, role },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function loginWithGoogle(
  idToken: string,
  auditMeta: { ip?: string; userAgent?: string }
) {
  const payload = await verifyGoogleToken(idToken);
  const user = await prisma.user.upsert({
    where: {
      provider_providerId: { provider: 'google', providerId: payload.sub },
    },
    create: {
      email: payload.email,
      name: payload.name,
      picture: payload.picture ?? null,
      provider: 'google',
      providerId: payload.sub,
      role: 'DRIVER',
    },
    update: {
      name: payload.name,
      picture: payload.picture ?? null,
    },
  });

  await prisma.loginAudit.create({
    data: {
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      ip: auditMeta.ip ?? null,
      userAgent: auditMeta.userAgent ?? null,
    },
  });

  const token = issueJwt(user.id, user.email, user.role);
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role,
      orgId: user.orgId,
    },
  };
}

export async function loginWithFacebook(
  accessToken: string,
  auditMeta: { ip?: string; userAgent?: string }
) {
  const payload = await verifyFacebookToken(accessToken);
  const email = payload.email ?? `${payload.id}@facebook.com`;
  const picture = payload.picture?.data?.url ?? null;

  const user = await prisma.user.upsert({
    where: {
      provider_providerId: { provider: 'facebook', providerId: payload.id },
    },
    create: {
      email,
      name: payload.name ?? email,
      picture,
      provider: 'facebook',
      providerId: payload.id,
      role: 'DRIVER',
    },
    update: {
      name: payload.name ?? undefined,
      picture: picture ?? undefined,
    },
  });

  await prisma.loginAudit.create({
    data: {
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      ip: auditMeta.ip ?? null,
      userAgent: auditMeta.userAgent ?? null,
    },
  });

  const token = issueJwt(user.id, user.email, user.role);
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role,
      orgId: user.orgId,
    },
  };
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) {
    throw new ApiError('Email already registered', 400, 'EMAIL_EXISTS');
  }
  // Assign to first existing org so new users see seeded data (e.g. seed org)
  const firstOrg = await prisma.organization.findFirst({ select: { id: true } });
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      provider: 'email',
      providerId: data.email,
      passwordHash,
      role: data.role,
      orgId: firstOrg?.id ?? null,
    },
  });
  const token = issueJwt(user.id, user.email, user.role);
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role,
      orgId: user.orgId,
    },
  };
}

export async function loginEmail(
  email: string,
  password: string,
  auditMeta: { ip?: string; userAgent?: string }
) {
  const user = await prisma.user.findFirst({
    where: { email, provider: 'email' },
  });
  if (!user || !user.passwordHash) {
    await logLoginFailed(email, auditMeta);
    throw new ApiError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    await logLoginFailed(user.id, auditMeta);
    throw new ApiError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }
  if (user.status !== 'ACTIVE') {
    throw new ApiError('Account is paused or frozen', 403, 'ACCOUNT_DISABLED');
  }
  await prisma.loginAudit.create({
    data: {
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      ip: auditMeta.ip ?? null,
      userAgent: auditMeta.userAgent ?? null,
    },
  });
  const token = issueJwt(user.id, user.email, user.role);
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role,
      orgId: user.orgId,
    },
  };
}

async function logLoginFailed(
  userIdOrEmail: string,
  auditMeta: { ip?: string; userAgent?: string }
) {
  const user = await prisma.user.findFirst({
    where: userIdOrEmail.includes('@') ? { email: userIdOrEmail } : { id: userIdOrEmail },
  });
  if (user) {
    await prisma.loginAudit.create({
      data: {
        userId: user.id,
        action: 'LOGIN_FAILED',
        ip: auditMeta.ip ?? null,
        userAgent: auditMeta.userAgent ?? null,
      },
    });
  }
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findFirst({
    where: { email, provider: 'email' },
  });
  if (!user) {
    return { ok: true };
  }
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + RESET_TOKEN_EXPIRY_HOURS);
  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });
  return { ok: true, resetToken: token };
}

export async function resetPassword(token: string, newPassword: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!record || record.expiresAt < new Date()) {
    throw new ApiError('Invalid or expired reset token', 400, 'INVALID_TOKEN');
  }
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.delete({ where: { id: record.id } }),
  ]);
  return { ok: true };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, picture: true, role: true, orgId: true },
  });
  if (!user) {
    throw new ApiError('User not found', 404, 'NOT_FOUND');
  }
  return user;
}

/** Dev-only: create or get test user by secret. Only when DEV_AUTH_SECRET is set. */
export async function devLogin(
  secret: string,
  auditMeta: { ip?: string; userAgent?: string }
) {
  const devSecret = env.DEV_AUTH_SECRET;
  if (!devSecret || env.NODE_ENV === 'production') {
    throw new ApiError('Not available', 404, 'NOT_FOUND');
  }
  if (secret !== devSecret) {
    throw new ApiError('Invalid secret', 401, 'UNAUTHORIZED');
  }
  const user = await prisma.user.upsert({
    where: {
      provider_providerId: { provider: 'google', providerId: 'dev-test-user' },
    },
    create: {
      email: 'dev@vehicles.local',
      name: 'Dev User',
      picture: null,
      provider: 'google',
      providerId: 'dev-test-user',
      role: 'ADMIN',
    },
    update: {},
  });
  await prisma.loginAudit.create({
    data: {
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      ip: auditMeta.ip ?? null,
      userAgent: auditMeta.userAgent ?? null,
    },
  });
  const token = issueJwt(user.id, user.email, user.role);
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role,
      orgId: user.orgId,
    },
  };
}

export type AuditSortKey = 'createdAt' | 'action' | 'ip' | 'userAgent' | 'user';

export async function listLoginAudit(
  orgId: string | null,
  options: {
    page?: number;
    limit?: number;
    sort?: AuditSortKey;
    order?: 'asc' | 'desc';
    search?: string;
  } = {}
) {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(100, Math.max(1, options.limit ?? 20));
  const sort = options.sort ?? 'createdAt';
  const order = options.order ?? 'desc';
  const search = options.search?.trim();

  const where = buildAuditWhere(orgId, search);

  const orderBy: { createdAt?: 'asc' | 'desc'; action?: 'asc' | 'desc'; ip?: 'asc' | 'desc'; userAgent?: 'asc' | 'desc'; user?: { email: 'asc' | 'desc' } } =
    sort === 'user' ? { user: { email: order } } : { [sort]: order };

  const [items, total] = await Promise.all([
    prisma.loginAudit.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
      },
    }),
    prisma.loginAudit.count({ where }),
  ]);

  return { data: items, total };
}

function buildAuditWhere(orgId: string | null, search: string | undefined) {
  type Where = Parameters<typeof prisma.loginAudit.findMany>[0]['where'];
  const base: Where = orgId ? { user: { orgId } } : {};
  if (!search) return base;

  const searchCond: Where = {
    OR: [
      { user: { ...(orgId ? { orgId } : {}), email: { contains: search, mode: 'insensitive' } } },
      { user: { ...(orgId ? { orgId } : {}), name: { contains: search, mode: 'insensitive' } } },
      { action: { contains: search, mode: 'insensitive' } },
      { ip: { contains: search, mode: 'insensitive' } },
    ],
  };
  return { AND: [base, searchCond] } as Where;
}
