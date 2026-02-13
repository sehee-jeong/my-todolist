import request from 'supertest';
import bcrypt from 'bcrypt';

jest.mock('../../src/config/db', () => ({
  __esModule: true,
  default: { query: jest.fn(), on: jest.fn() },
}));

import app from '../../src/app';
import pool from '../../src/config/db';

const mockQuery = pool.query as jest.Mock;

beforeEach(() => mockQuery.mockReset());

describe('Auth API', () => {
  // SC-H-01: 신규 회원가입
  describe('SC-H-01 POST /api/auth/signup 정상', () => {
    it('이메일·비밀번호·닉네임 입력 시 201과 생성된 회원 정보 반환', async () => {
      const now = '2026-01-01T00:00:00.000Z';
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({
          rows: [{ id: 'member-uuid-1', email: 'user@example.com', nickname: 'tester', created_at: now }],
        });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'user@example.com', password: 'pass1234', nickname: 'tester' });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe('user@example.com');
      expect(res.body.nickname).toBe('tester');
      expect(res.body).not.toHaveProperty('password');
    });
  });

  // SC-H-02: 로그인 및 JWT 발급
  describe('SC-H-02 POST /api/auth/login 정상', () => {
    it('올바른 이메일·비밀번호로 로그인 시 200과 accessToken·refreshToken 반환', async () => {
      const hashedPassword = await bcrypt.hash('pass1234', 10);
      const now = '2026-01-01T00:00:00.000Z';
      mockQuery
        .mockResolvedValueOnce({
          rows: [{ id: 'member-uuid-1', email: 'user@example.com', password: hashedPassword, nickname: 'tester', created_at: now }],
        })
        .mockResolvedValueOnce({ rows: [] }); // INSERT refresh_token

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@example.com', password: 'pass1234' });

      expect(res.status).toBe(200);
      expect(typeof res.body.accessToken).toBe('string');
      expect(res.body.accessToken.length).toBeGreaterThan(0);
      expect(typeof res.body.refreshToken).toBe('string');
      expect(res.body.refreshToken.length).toBeGreaterThan(0);
    });
  });

  // SC-E-01: 중복 이메일로 회원가입 시도
  describe('SC-E-01 POST /api/auth/signup 중복 이메일', () => {
    it('이미 존재하는 이메일로 가입 시 409 반환', async () => {
      const now = '2026-01-01T00:00:00.000Z';
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'member-uuid-1', email: 'user@example.com', password: 'hashed', nickname: 'existing', created_at: now }],
      });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'user@example.com', password: 'pass1234', nickname: 'tester' });

      expect(res.status).toBe(409);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });

  // SC-E-02: 비밀번호 정책 미충족 (7자, 숫자만, 영문만)
  describe('SC-E-02 POST /api/auth/signup 비밀번호 정책 미충족', () => {
    it('7자 이하 비밀번호 시 400 반환 (DB 호출 없음)', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'user@example.com', password: 'ab1234', nickname: 'tester' });

      expect(res.status).toBe(400);
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('숫자만으로 구성된 비밀번호 시 400 반환 (DB 호출 없음)', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'user@example.com', password: '12345678', nickname: 'tester' });

      expect(res.status).toBe(400);
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('영문만으로 구성된 비밀번호 시 400 반환 (DB 호출 없음)', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'user@example.com', password: 'abcdefgh', nickname: 'tester' });

      expect(res.status).toBe(400);
      expect(mockQuery).not.toHaveBeenCalled();
    });
  });

  // SC-E-03: 잘못된 비밀번호로 로그인 시도
  describe('SC-E-03 POST /api/auth/login 잘못된 비밀번호', () => {
    it('올바르지 않은 비밀번호로 로그인 시 401 반환', async () => {
      const hashedPassword = await bcrypt.hash('correct1234', 10);
      const now = '2026-01-01T00:00:00.000Z';
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'member-uuid-1', email: 'user@example.com', password: hashedPassword, nickname: 'tester', created_at: now }],
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@example.com', password: 'wrongpass1' });

      expect(res.status).toBe(401);
      expect(res.body).not.toHaveProperty('accessToken');
    });
  });

  // SC-H-refresh: Refresh token으로 새 토큰 발급
  describe('POST /api/auth/refresh 정상', () => {
    it('유효한 refresh token으로 새 accessToken·refreshToken 반환', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      mockQuery
        .mockResolvedValueOnce({
          rows: [{ id: 'rt-uuid-1', member_id: 'member-uuid-1', token: 'valid-refresh-token', expires_at: futureDate, created_at: '2026-01-01T00:00:00.000Z' }],
        })
        .mockResolvedValueOnce({ rowCount: 1, rows: [] }) // DELETE old token
        .mockResolvedValueOnce({ rows: [] }); // INSERT new token

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'valid-refresh-token' });

      expect(res.status).toBe(200);
      expect(typeof res.body.accessToken).toBe('string');
      expect(typeof res.body.refreshToken).toBe('string');
    });
  });

  // SC-E-refresh: 만료된 refresh token
  describe('POST /api/auth/refresh 만료 토큰', () => {
    it('만료된 refresh token으로 요청 시 401 반환', async () => {
      const pastDate = new Date(Date.now() - 1000).toISOString();
      mockQuery
        .mockResolvedValueOnce({
          rows: [{ id: 'rt-uuid-1', member_id: 'member-uuid-1', token: 'expired-token', expires_at: pastDate, created_at: '2026-01-01T00:00:00.000Z' }],
        })
        .mockResolvedValueOnce({ rowCount: 1, rows: [] }); // DELETE expired token

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'expired-token' });

      expect(res.status).toBe(401);
    });
  });

  // SC-H-logout: 로그아웃
  describe('POST /api/auth/logout 정상', () => {
    it('refresh token으로 로그아웃 시 204 반환', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [] }); // DELETE token

      const res = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken: 'some-refresh-token' });

      expect(res.status).toBe(204);
    });
  });
});
