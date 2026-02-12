import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authService from '../../services/authService';
import apiClient from '../../services/apiClient';

vi.mock('../../services/apiClient', () => ({
  default: {
    request: vi.fn(),
  },
}));

const mockRequest = vi.mocked(apiClient.request);

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('authService', () => {
  describe('signup', () => {
    it('POST /auth/signup 호출', async () => {
      mockRequest.mockResolvedValueOnce(undefined);
      await authService.signup({ email: 'a@b.com', password: 'pass1234', nickname: '테스트' });
      expect(mockRequest).toHaveBeenCalledWith('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email: 'a@b.com', password: 'pass1234', nickname: '테스트' }),
      });
    });
  });

  describe('login', () => {
    it('성공 시 토큰 localStorage 저장', async () => {
      mockRequest.mockResolvedValueOnce({
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
      });

      await authService.login({ email: 'a@b.com', password: 'pass1234' });

      expect(localStorage.getItem('accessToken')).toBe('access-123');
      expect(localStorage.getItem('refreshToken')).toBe('refresh-456');
    });

    it('응답 데이터 반환', async () => {
      mockRequest.mockResolvedValueOnce({
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
      });

      const result = await authService.login({ email: 'a@b.com', password: 'pass1234' });
      expect(result.accessToken).toBe('access-123');
    });
  });

  describe('logout', () => {
    it('refreshToken 있으면 /auth/logout 호출 후 localStorage 제거', async () => {
      localStorage.setItem('accessToken', 'access-123');
      localStorage.setItem('refreshToken', 'refresh-456');
      mockRequest.mockResolvedValueOnce(undefined);

      await authService.logout();

      expect(mockRequest).toHaveBeenCalledWith('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'refresh-456' }),
      });
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });

    it('refreshToken 없으면 API 호출 없이 localStorage만 제거', async () => {
      localStorage.setItem('accessToken', 'access-123');

      await authService.logout();

      expect(mockRequest).not.toHaveBeenCalled();
      expect(localStorage.getItem('accessToken')).toBeNull();
    });
  });

  describe('getToken', () => {
    it('토큰 없으면 null 반환', () => {
      expect(authService.getToken()).toBeNull();
    });

    it('토큰 있으면 반환', () => {
      localStorage.setItem('accessToken', 'my-token');
      expect(authService.getToken()).toBe('my-token');
    });
  });
});
