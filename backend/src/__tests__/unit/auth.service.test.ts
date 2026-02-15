import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authService from '../../usecases/auth.service.js';

vi.mock('../../infrastructure/db.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    loginAudit: { create: vi.fn() },
    passwordResetToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn((plain: string) => Promise.resolve(`hashed_${plain}`)),
    compare: vi.fn((plain: string, hash: string) => Promise.resolve(hash === `hashed_${plain}`)),
  },
}));

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMe', () => {
    it('should return user when found', async () => {
      const { prisma } = await import('../../infrastructure/db.js');
      const mockUser = {
        id: 'u1',
        email: 'a@b.com',
        name: 'Test',
        picture: null,
        role: 'DRIVER',
        orgId: null,
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);

      const result = await authService.getMe('u1');
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'u1' },
        select: {
          id: true,
          email: true,
          name: true,
          picture: true,
          role: true,
          orgId: true,
        },
      });
    });

    it('should throw ApiError when user not found', async () => {
      const { prisma } = await import('../../infrastructure/db.js');
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(authService.getMe('none')).rejects.toMatchObject({
        statusCode: 404,
        message: 'User not found',
      });
    });
  });

  describe('register', () => {
    it('should create user and return token and user', async () => {
      const { prisma } = await import('../../infrastructure/db.js');
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      const created = {
        id: 'u-new',
        email: 'new@test.com',
        name: 'New User',
        picture: null,
        role: 'DRIVER',
        orgId: null,
      };
      vi.mocked(prisma.user.create).mockResolvedValue(created as never);

      const result = await authService.register({
        name: 'New User',
        email: 'new@test.com',
        password: 'Password123!',
        role: 'DRIVER',
      });

      expect(result).toHaveProperty('token');
      expect(result.user).toEqual(created);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'new@test.com' } });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'new@test.com',
          name: 'New User',
          provider: 'email',
          providerId: 'new@test.com',
          role: 'DRIVER',
        }),
      });
    });

    it('should throw when email already exists', async () => {
      const { prisma } = await import('../../infrastructure/db.js');
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'existing' } as never);

      await expect(
        authService.register({
          name: 'X',
          email: 'existing@test.com',
          password: 'Password123!',
          role: 'DRIVER',
        })
      ).rejects.toMatchObject({ statusCode: 400, code: 'EMAIL_EXISTS' });
    });
  });

  describe('loginEmail', () => {
    it('should return token and user when password matches', async () => {
      const { prisma } = await import('../../infrastructure/db.js');
      const user = {
        id: 'u1',
        email: 'u@test.com',
        name: 'User',
        picture: null,
        passwordHash: 'hashed_Password123!',
        role: 'DRIVER',
        orgId: null,
        status: 'ACTIVE',
      };
      vi.mocked(prisma.user.findFirst).mockResolvedValue(user as never);

      const result = await authService.loginEmail('u@test.com', 'Password123!', {});

      expect(result).toHaveProperty('token');
      expect(result.user.id).toBe('u1');
      expect(prisma.loginAudit.create).toHaveBeenCalledWith({
        data: { userId: 'u1', action: 'LOGIN_SUCCESS', ip: null, userAgent: null },
      });
    });

    it('should throw when user not found', async () => {
      const { prisma } = await import('../../infrastructure/db.js');
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

      await expect(
        authService.loginEmail('unknown@test.com', 'Password123!', {})
      ).rejects.toMatchObject({ statusCode: 401, code: 'INVALID_CREDENTIALS' });
    });

    it('should throw when password does not match', async () => {
      const { prisma } = await import('../../infrastructure/db.js');
      const user = {
        id: 'u1',
        email: 'u@test.com',
        name: 'User',
        picture: null,
        passwordHash: 'hashed_WrongPassword',
        role: 'DRIVER',
        orgId: null,
        status: 'ACTIVE',
      };
      vi.mocked(prisma.user.findFirst).mockResolvedValue(user as never);

      await expect(
        authService.loginEmail('u@test.com', 'Password123!', {})
      ).rejects.toMatchObject({ statusCode: 401, code: 'INVALID_CREDENTIALS' });
    });
  });

  describe('forgotPassword', () => {
    it('should return ok when user does not exist (no leak)', async () => {
      const { prisma } = await import('../../infrastructure/db.js');
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

      const result = await authService.forgotPassword('nonexistent@test.com');
      expect(result).toEqual({ ok: true });
      expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
    });

    it('should create reset token when user exists', async () => {
      const { prisma } = await import('../../infrastructure/db.js');
      vi.mocked(prisma.user.findFirst).mockResolvedValue({
        id: 'u1',
        email: 'u@test.com',
        provider: 'email',
      } as never);
      vi.mocked(prisma.passwordResetToken.create).mockResolvedValue({
        id: 't1',
        token: 'generated',
        userId: 'u1',
        expiresAt: new Date(),
      } as never);

      const result = await authService.forgotPassword('u@test.com');
      expect(result.ok).toBe(true);
      expect(result.resetToken).toMatch(/^[a-f0-9]{64}$/);
      expect(prisma.passwordResetToken.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ userId: 'u1' }),
      });
    });
  });

  describe('resetPassword', () => {
    it('should update password and delete token when token valid', async () => {
      const { prisma } = await import('../../infrastructure/db.js');
      const future = new Date();
      future.setHours(future.getHours() + 1);
      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue({
        id: 't1',
        token: 'valid-token',
        userId: 'u1',
        expiresAt: future,
        user: { id: 'u1' },
      } as never);
      vi.mocked(prisma.$transaction).mockImplementation(async (ops: unknown[]) => {
        const results: unknown[] = [];
        for (const op of ops as Array<() => Promise<unknown>>) {
          results.push(await (typeof op === 'function' ? op() : op));
        }
        return results;
      });

      const result = await authService.resetPassword('valid-token', 'NewPassword123!');
      expect(result).toEqual({ ok: true });
      expect(prisma.passwordResetToken.findUnique).toHaveBeenCalledWith({
        where: { token: 'valid-token' },
        include: { user: true },
      });
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw when token invalid or expired', async () => {
      const { prisma } = await import('../../infrastructure/db.js');
      vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(null);

      await expect(
        authService.resetPassword('invalid-token', 'NewPassword123!')
      ).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_TOKEN' });
    });
  });
});
