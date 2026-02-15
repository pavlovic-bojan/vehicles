import { api } from '../boot/axios';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  role: string;
  orgId: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const authApi = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post<{ data: AuthResponse }>('/api/auth/register', data),

  login: (email: string, password: string) =>
    api.post<{ data: AuthResponse }>('/api/auth/login', { email, password }),

  loginGoogle: (idToken: string) =>
    api.post<{ data: AuthResponse }>('/api/auth/google', { idToken }),

  loginFacebook: (accessToken: string) =>
    api.post<{ data: AuthResponse }>('/api/auth/facebook', { accessToken }),

  getMe: () => api.get<{ data: AuthUser }>('/api/auth/me'),

  forgotPassword: (email: string) =>
    api.post<{ data: { ok: boolean; resetToken?: string } }>('/api/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post<{ data: { ok: boolean } }>('/api/auth/reset-password', { token, newPassword }),

  loginDev: (secret: string) =>
    api.post<{ data: AuthResponse }>('/api/auth/dev', { secret }),

  getAudit: (params?: { limit?: number }) =>
    api.get<{ data: LoginAuditEntry[] }>('/api/auth/audit', { params }),
};

export interface LoginAuditEntry {
  id: string;
  userId: string;
  action: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  user: { id: string; email: string; name: string; role: string };
}
