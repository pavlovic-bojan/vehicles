import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import * as authService from '../../usecases/auth.service.js';
import { ApiError } from '../../utils/ApiError.js';

vi.mock('../../usecases/auth.service.js');

const getApp = async () => {
  const { app } = await import('../../app.js');
  return app;
};

describe('Auth routes integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should return 201 and token when valid body', async () => {
      const app = await getApp();
      const mockResult = {
        token: 'jwt-token',
        user: {
          id: 'u1',
          email: 'u@test.com',
          name: 'User',
          picture: null,
          role: 'DRIVER',
          orgId: null,
        },
      };
      vi.mocked(authService.register).mockResolvedValue(mockResult);

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User', email: 'u@test.com', password: 'Password123!', role: 'DRIVER' })
        .expect(201);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data.token).toBe('jwt-token');
      expect(res.body.data.user.email).toBe('u@test.com');
    });

    it('should return 400 when validation fails', async () => {
      const app = await getApp();

      await request(app)
        .post('/api/auth/register')
        .send({ name: '', email: 'invalid', password: 'short' })
        .expect(400);
    });

    it('should return 400 when email already exists', async () => {
      const app = await getApp();
      vi.mocked(authService.register).mockRejectedValue(new ApiError('Email already registered', 400, 'EMAIL_EXISTS'));

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User', email: 'existing@test.com', password: 'Password123!' })
        .expect(400);

      expect(res.body.code).toBe('EMAIL_EXISTS');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 200 and token when valid', async () => {
      const app = await getApp();
      const mockResult = {
        token: 'jwt-token',
        user: {
          id: 'u1',
          email: 'u@test.com',
          name: 'User',
          picture: null,
          role: 'DRIVER',
          orgId: null,
        },
      };
      vi.mocked(authService.loginEmail).mockResolvedValue(mockResult);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'u@test.com', password: 'Password123!' })
        .expect(200);

      expect(res.body.data.token).toBe('jwt-token');
    });

    it('should return 401 when invalid credentials', async () => {
      const app = await getApp();
      vi.mocked(authService.loginEmail).mockRejectedValue(new ApiError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'u@test.com', password: 'wrong' })
        .expect(401);

      expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should return 200 when email sent', async () => {
      const app = await getApp();
      vi.mocked(authService.forgotPassword).mockResolvedValue({ ok: true });

      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'u@test.com' })
        .expect(200);
    });

    it('should return 400 when email invalid', async () => {
      const app = await getApp();

      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'not-an-email' })
        .expect(400);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should return 200 when token valid', async () => {
      const app = await getApp();
      vi.mocked(authService.resetPassword).mockResolvedValue({ ok: true });

      await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'valid-token', newPassword: 'NewPassword123!' })
        .expect(200);
    });

    it('should return 400 when token invalid', async () => {
      const app = await getApp();
      vi.mocked(authService.resetPassword).mockRejectedValue(new ApiError('Invalid or expired reset token', 400, 'INVALID_TOKEN'));

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'invalid', newPassword: 'NewPassword123!' })
        .expect(400);

      expect(res.body.code).toBe('INVALID_TOKEN');
    });
  });
});
