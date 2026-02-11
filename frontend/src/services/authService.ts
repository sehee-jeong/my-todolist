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
  localStorage.setItem('token', data.token);
  return data;
}

export function logout(): void {
  localStorage.removeItem('token');
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}
