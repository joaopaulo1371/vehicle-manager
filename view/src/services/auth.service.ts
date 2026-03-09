import { api } from 'boot/axios';
import type { AuthResponse } from 'src/types/auth';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export function login(payload: LoginPayload) {
  return api.post<AuthResponse>('/auth/login', payload);
}

export function register(payload: RegisterPayload) {
  return api.post<AuthResponse>('/auth/register', payload);
}

export function refresh(refreshToken: string) {
  return api.post<AuthResponse>('/auth/refresh', { refreshToken });
}

export function logout(refreshToken: string) {
  return api.post('/auth/logout', { refreshToken });
}

export function me() {
  return api.get('/auth/me');
}
