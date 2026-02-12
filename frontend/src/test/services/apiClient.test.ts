import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import apiClient from '../../services/apiClient';

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const mockFetch = () => vi.mocked(fetch);

describe('apiClient', () => {
  it('Authorization 헤더 없이 요청 (토큰 없음)', async () => {
    mockFetch().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: 'ok' }),
    } as Response);

    await apiClient.request('/test');

    const [, options] = mockFetch().mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Record<string, string>;
    expect(headers['Authorization']).toBeUndefined();
  });

  it('토큰 있으면 Authorization 헤더 포함', async () => {
    localStorage.setItem('accessToken', 'my-token');

    mockFetch().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: 'ok' }),
    } as Response);

    await apiClient.request('/test');

    const [, options] = mockFetch().mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer my-token');
  });

  it('204 응답은 undefined 반환', async () => {
    mockFetch().mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => null,
    } as Response);

    const result = await apiClient.request('/test');
    expect(result).toBeUndefined();
  });

  it('401 응답 시 토큰 제거', async () => {
    localStorage.setItem('accessToken', 'expired-token');
    localStorage.setItem('refreshToken', 'refresh-token');

    mockFetch().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    } as Response);

    await expect(apiClient.request('/test')).rejects.toThrow('Unauthorized');
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('비 401 오류 응답 시 에러 reject', async () => {
    mockFetch().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Bad Request' }),
    } as Response);

    await expect(apiClient.request('/test')).rejects.toMatchObject({
      status: 400,
      message: 'Bad Request',
    });
  });

  it('POST 요청에 body 포함', async () => {
    mockFetch().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: '1' }),
    } as Response);

    await apiClient.request('/test', {
      method: 'POST',
      body: JSON.stringify({ title: '할 일' }),
    });

    const [url, options] = mockFetch().mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/test');
    expect(options.method).toBe('POST');
    expect(options.body).toBe(JSON.stringify({ title: '할 일' }));
  });
});
