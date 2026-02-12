import apiClient from './apiClient';
import type { AuthResponse, LoginDto, SignupDto } from '../types/member.types';

export async function signup(dto: SignupDto): Promise<void> {
  await apiClient.request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function login(dto: LoginDto): Promise<AuthResponse> {
  const data = await apiClient.request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  return data;
}

export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    await apiClient.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export function getToken(): string | null {
  return localStorage.getItem('accessToken');
}
