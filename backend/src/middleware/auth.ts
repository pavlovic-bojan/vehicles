import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { prisma } from '../infrastructure/db.js';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: { id: string; email: string; name: string; role: string; orgId: string | null };
}

/**
 * Authenticates request via Bearer JWT. Sets req.user or throws 401.
 */
export async function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next(new ApiError('Unauthorized', 401, 'UNAUTHORIZED'));
    return;
  }

  const token = authHeader.slice(7);
  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    next(new ApiError('Invalid or expired token', 401, 'UNAUTHORIZED'));
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true, orgId: true, status: true },
  });

  if (!user) {
    next(new ApiError('User not found', 401, 'UNAUTHORIZED'));
    return;
  }

  if (user.status !== 'ACTIVE') {
    next(new ApiError('Account is paused or frozen', 403, 'ACCOUNT_DISABLED'));
    return;
  }

  req.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    orgId: user.orgId,
  };
  next();
}
