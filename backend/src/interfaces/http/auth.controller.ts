import type { Response } from 'express';
import { body, validationResult } from 'express-validator';
import type { AuthRequest } from '../../middleware/auth.js';
import { ApiError } from '../../utils/ApiError.js';
import * as authService from '../../usecases/auth.service.js';

export async function loginGoogle(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  try {
    const { idToken } = req.body as { idToken: string };
    const ip = req.ip ?? req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const result = await authService.loginWithGoogle(idToken, { ip, userAgent });
    res.json({ data: result });
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError('Login failed', 500);
  }
}

export async function loginFacebook(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  try {
    const { accessToken } = req.body as { accessToken: string };
    const ip = req.ip ?? req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const result = await authService.loginWithFacebook(accessToken, { ip, userAgent });
    res.json({ data: result });
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError('Login failed', 500);
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError('Unauthorized', 401);
  }
  const user = await authService.getMe(req.user.id);
  res.json({ data: user });
}

export async function listAudit(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError('Unauthorized', 401);
  }
  if (req.user.role !== 'ADMIN') {
    throw new ApiError('Admin only', 403, 'FORBIDDEN');
  }
  const limit = Math.min(Number(req.query.limit) || 200, 500);
  const items = await authService.listLoginAudit(req.user.orgId ?? null, limit);
  res.json({ data: items });
}

export async function register(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  try {
    const { name, email, password, role } = req.body as { name: string; email: string; password: string; role?: string };
    const result = await authService.register({
      name,
      email,
      password,
      role: (role as 'ADMIN' | 'DRIVER' | 'AUDITOR') ?? 'DRIVER',
    });
    res.status(201).json({ data: result });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Registration failed', 500);
  }
}

export async function login(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  try {
    const { email, password } = req.body as { email: string; password: string };
    const ip = req.ip ?? req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const result = await authService.loginEmail(email, password, { ip, userAgent });
    res.json({ data: result });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Login failed', 500);
  }
}

export async function forgotPassword(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  try {
    const { email } = req.body as { email: string };
    const result = await authService.forgotPassword(email);
    res.json({ data: result });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Request failed', 500);
  }
}

export async function resetPassword(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  try {
    const { token, newPassword } = req.body as { token: string; newPassword: string };
    await authService.resetPassword(token, newPassword);
    res.json({ data: { ok: true } });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Reset failed', 500);
  }
}

export async function devLogin(req: AuthRequest, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  try {
    const { secret } = req.body as { secret: string };
    const ip = req.ip ?? req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const result = await authService.devLogin(secret, { ip, userAgent });
    res.json({ data: result });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Login failed', 500);
  }
}
