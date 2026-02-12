import request from 'supertest';
import jwt from 'jsonwebtoken';

jest.mock('../../src/config/db', () => ({
  __esModule: true,
  default: { query: jest.fn(), on: jest.fn() },
}));

import app from '../../src/app';
import pool from '../../src/config/db';

const mockQuery = pool.query as jest.Mock;

beforeEach(() => mockQuery.mockReset());

type TodoRowOverrides = {
  id?: string;
  member_id?: string;
  title?: string;
  description?: string | null;
  due_date?: string | null;
  status?: 'PENDING' | 'DONE';
  created_at?: string;
  updated_at?: string;
};

function makeToken(memberId: string): string {
  return jwt.sign({ memberId }, process.env.JWT_SECRET!, { expiresIn: '1h' });
}

function makeTodoRow(overrides: TodoRowOverrides = {}) {
  return {
    id: 'todo-uuid-1',
    member_id: 'user-uuid-1',
    title: 'Test Todo',
    description: null,
    due_date: null,
    status: 'PENDING' as const,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const USER_ID = 'user-uuid-1';
const OTHER_USER_ID = 'user-uuid-2';
const TODO_ID = 'todo-uuid-1';

describe('Todo API', () => {
  // SC-H-03: 할 일 생성 (제목만)
  describe('SC-H-03 POST /api/todos 제목만 입력', () => {
    it('제목만 포함한 요청 시 201과 status=PENDING 반환', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [makeTodoRow()] });

      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${makeToken(USER_ID)}`)
        .send({ title: 'Test Todo' });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('PENDING');
      expect(res.body.overdue).toBe(false);
    });
  });

  // SC-H-04: 할 일 생성 (전체 필드)
  describe('SC-H-04 POST /api/todos 전체 필드 입력', () => {
    it('제목·설명·dueDate 모두 입력 시 201과 status=PENDING 반환', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [makeTodoRow({ title: '보고서 작성', description: '1분기 보고서', due_date: '2099-12-31' })],
      });

      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${makeToken(USER_ID)}`)
        .send({ title: '보고서 작성', description: '1분기 보고서', dueDate: '2099-12-31' });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('PENDING');
      expect(res.body.overdue).toBe(false);
    });
  });

  // SC-H-05: 할 일 목록 조회 (overdue 없음)
  describe('SC-H-05 GET /api/todos overdue 없음', () => {
    it('dueDate가 미래이거나 null인 PENDING 항목은 overdue:false 반환', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          makeTodoRow({ id: 'todo-1', due_date: '2099-12-31' }),
          makeTodoRow({ id: 'todo-2', due_date: null }),
        ],
      });

      const res = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${makeToken(USER_ID)}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].overdue).toBe(false);
      expect(res.body[1].overdue).toBe(false);
    });
  });

  // SC-H-06: 할 일 목록 조회 (overdue 있음)
  describe('SC-H-06 GET /api/todos overdue 있음', () => {
    it('dueDate가 과거인 PENDING 항목은 overdue:true 반환', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [makeTodoRow({ due_date: '2020-01-01', status: 'PENDING' })],
      });

      const res = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${makeToken(USER_ID)}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].overdue).toBe(true);
    });
  });

  // SC-H-07: 할 일 수정
  describe('SC-H-07 PATCH /api/todos/:id 수정', () => {
    it('본인 소유 할 일 수정 요청 시 200과 변경된 내용 반환', async () => {
      const updated = makeTodoRow({ title: '수정된 제목' });
      mockQuery
        .mockResolvedValueOnce({ rows: [makeTodoRow()] })
        .mockResolvedValueOnce({ rows: [updated] });

      const res = await request(app)
        .patch(`/api/todos/${TODO_ID}`)
        .set('Authorization', `Bearer ${makeToken(USER_ID)}`)
        .send({ title: '수정된 제목' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('수정된 제목');
    });
  });

  // SC-H-08: 할 일 삭제
  describe('SC-H-08 DELETE /api/todos/:id 삭제', () => {
    it('본인 소유 할 일 삭제 요청 시 204 반환', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [makeTodoRow()] })
        .mockResolvedValueOnce({ rowCount: 1 });

      const res = await request(app)
        .delete(`/api/todos/${TODO_ID}`)
        .set('Authorization', `Bearer ${makeToken(USER_ID)}`);

      expect(res.status).toBe(204);
    });
  });

  // SC-H-09: 할 일 완료 처리 (PENDING → DONE)
  describe('SC-H-09 PATCH /api/todos/:id/complete PENDING→DONE', () => {
    it('PENDING 항목에 완료 처리 시 200과 status=DONE 반환', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [makeTodoRow({ status: 'PENDING' })] })
        .mockResolvedValueOnce({ rows: [makeTodoRow({ status: 'DONE' })] });

      const res = await request(app)
        .patch(`/api/todos/${TODO_ID}/complete`)
        .set('Authorization', `Bearer ${makeToken(USER_ID)}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('DONE');
    });
  });

  // SC-H-10: 할 일 완료 취소 (DONE → PENDING)
  describe('SC-H-10 PATCH /api/todos/:id/revert DONE→PENDING', () => {
    it('DONE 항목에 완료 취소 시 200과 status=PENDING 반환', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [makeTodoRow({ status: 'DONE' })] })
        .mockResolvedValueOnce({ rows: [makeTodoRow({ status: 'PENDING' })] });

      const res = await request(app)
        .patch(`/api/todos/${TODO_ID}/revert`)
        .set('Authorization', `Bearer ${makeToken(USER_ID)}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('PENDING');
    });
  });

  // SC-H-11: DONE 항목 overdue 배지 미표시
  describe('SC-H-11 GET /api/todos DONE인데 dueDate 과거', () => {
    it('status=DONE이고 dueDate가 과거여도 overdue:false 반환', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [makeTodoRow({ due_date: '2020-01-01', status: 'DONE' })],
      });

      const res = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${makeToken(USER_ID)}`);

      expect(res.status).toBe(200);
      expect(res.body[0].overdue).toBe(false);
    });
  });

  // SC-E-04: 미인증 상태에서 할 일 생성
  describe('SC-E-04 POST /api/todos 인증 없음', () => {
    it('Authorization 헤더 없이 요청 시 401 반환', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ title: 'Test' });

      expect(res.status).toBe(401);
      expect(mockQuery).not.toHaveBeenCalled();
    });
  });

  // SC-E-05: 할 일 생성 시 제목 누락
  describe('SC-E-05 POST /api/todos 제목 없음', () => {
    it('제목 없이 요청 시 400 반환', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${makeToken(USER_ID)}`)
        .send({ description: '설명만 있음' });

      expect(res.status).toBe(400);
    });
  });

  // SC-E-06: 미인증 상태에서 할 일 수정
  describe('SC-E-06 PATCH /api/todos/:id 인증 없음', () => {
    it('Authorization 헤더 없이 수정 요청 시 401 반환', async () => {
      const res = await request(app)
        .patch(`/api/todos/${TODO_ID}`)
        .send({ title: '수정' });

      expect(res.status).toBe(401);
      expect(mockQuery).not.toHaveBeenCalled();
    });
  });

  // SC-E-07: 타인 소유 할 일 수정 시도
  describe('SC-E-07 PATCH /api/todos/:id 타인 소유 수정 시도', () => {
    it('다른 사용자 소유 할 일 수정 시 403 반환', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [makeTodoRow({ member_id: OTHER_USER_ID })],
      });

      const res = await request(app)
        .patch(`/api/todos/${TODO_ID}`)
        .set('Authorization', `Bearer ${makeToken(USER_ID)}`)
        .send({ title: '내 것처럼 수정' });

      expect(res.status).toBe(403);
    });
  });

  // SC-E-08: 미인증 상태에서 할 일 삭제
  describe('SC-E-08 DELETE /api/todos/:id 인증 없음', () => {
    it('Authorization 헤더 없이 삭제 요청 시 401 반환', async () => {
      const res = await request(app)
        .delete(`/api/todos/${TODO_ID}`);

      expect(res.status).toBe(401);
      expect(mockQuery).not.toHaveBeenCalled();
    });
  });

  // SC-E-09: 타인 소유 할 일 삭제 시도
  describe('SC-E-09 DELETE /api/todos/:id 타인 소유 삭제 시도', () => {
    it('다른 사용자 소유 할 일 삭제 시 403 반환', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [makeTodoRow({ member_id: OTHER_USER_ID })],
      });

      const res = await request(app)
        .delete(`/api/todos/${TODO_ID}`)
        .set('Authorization', `Bearer ${makeToken(USER_ID)}`);

      expect(res.status).toBe(403);
    });
  });

  // SC-E-10: 이미 DONE 상태에서 완료 처리
  describe('SC-E-10 PATCH /api/todos/:id/complete 이미 DONE', () => {
    it('DONE 항목에 완료 처리 요청 시 400 반환', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [makeTodoRow({ status: 'DONE' })],
      });

      const res = await request(app)
        .patch(`/api/todos/${TODO_ID}/complete`)
        .set('Authorization', `Bearer ${makeToken(USER_ID)}`);

      expect(res.status).toBe(400);
    });
  });

  // SC-E-11: 이미 PENDING 상태에서 완료 취소
  describe('SC-E-11 PATCH /api/todos/:id/revert 이미 PENDING', () => {
    it('PENDING 항목에 완료 취소 요청 시 400 반환', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [makeTodoRow({ status: 'PENDING' })],
      });

      const res = await request(app)
        .patch(`/api/todos/${TODO_ID}/revert`)
        .set('Authorization', `Bearer ${makeToken(USER_ID)}`);

      expect(res.status).toBe(400);
    });
  });

  // SC-E-12: 목록 조회 시 타인 항목 미포함
  describe('SC-E-12 GET /api/todos 타인 항목 미포함', () => {
    it('본인 memberId로 필터링된 항목만 반환', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          makeTodoRow({ id: 'todo-mine-1', member_id: USER_ID, title: '내 할 일' }),
        ],
      });

      const res = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${makeToken(USER_ID)}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].memberId).toBe(USER_ID);

      const queryCall = mockQuery.mock.calls[0] as [string, string[]];
      expect(queryCall[1]).toContain(USER_ID);
      expect(res.body.every((t: { memberId: string }) => t.memberId === USER_ID)).toBe(true);
    });
  });

  // SC-E2E-01: 직장인 김민준 전체 플로우
  describe('SC-E2E-01 직장인 김민준 전체 플로우', () => {
    it('회원가입→로그인→할 일 생성→목록조회(overdue)→완료처리→목록재조회(overdue:false)', async () => {
      const now = '2026-01-01T00:00:00.000Z';
      const hashedPassword = await bcrypt.hash('minjun1234', 10);

      // 1. 회원가입: findByEmail(없음) → create(회원)
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({
          rows: [{ id: 'minjun-id', email: 'minjun@example.com', nickname: '김민준', created_at: now }],
        });

      const signupRes = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'minjun@example.com', password: 'minjun1234', nickname: '김민준' });

      expect(signupRes.status).toBe(201);

      // 2. 로그인: findByEmail(해시된 비밀번호 가진 회원)
      mockQuery
        .mockResolvedValueOnce({
          rows: [{ id: 'minjun-id', email: 'minjun@example.com', password: hashedPassword, nickname: '김민준', created_at: now }],
        })
        .mockResolvedValueOnce({ rows: [] }); // INSERT refresh_token

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'minjun@example.com', password: 'minjun1234' });

      expect(loginRes.status).toBe(200);
      const token = loginRes.body.accessToken as string;
      expect(typeof token).toBe('string');

      // 3. "Q1 보고서 제출" 생성 (dueDate=3일 전, PENDING → overdue:true 예정)
      const pastDate = '2020-01-01';
      mockQuery.mockResolvedValueOnce({
        rows: [makeTodoRow({ id: 'todo-q1', member_id: 'minjun-id', title: 'Q1 보고서 제출', due_date: pastDate })],
      });

      const createQ1Res = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Q1 보고서 제출', dueDate: pastDate });

      expect(createQ1Res.status).toBe(201);
      expect(createQ1Res.body.status).toBe('PENDING');

      // 4. "팀 회의 준비" 생성 (dueDate 없음, PENDING → overdue:false)
      mockQuery.mockResolvedValueOnce({
        rows: [makeTodoRow({ id: 'todo-meeting', member_id: 'minjun-id', title: '팀 회의 준비', due_date: null })],
      });

      const createMeetingRes = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '팀 회의 준비' });

      expect(createMeetingRes.status).toBe(201);
      expect(createMeetingRes.body.status).toBe('PENDING');

      // 5. 목록 조회: "Q1 보고서 제출" overdue:true, "팀 회의 준비" overdue:false
      mockQuery.mockResolvedValueOnce({
        rows: [
          makeTodoRow({ id: 'todo-q1', member_id: 'minjun-id', title: 'Q1 보고서 제출', due_date: pastDate, status: 'PENDING' }),
          makeTodoRow({ id: 'todo-meeting', member_id: 'minjun-id', title: '팀 회의 준비', due_date: null, status: 'PENDING' }),
        ],
      });

      const listRes = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${token}`);

      expect(listRes.status).toBe(200);
      const q1Item = listRes.body.find((t: { title: string }) => t.title === 'Q1 보고서 제출');
      const meetingItem = listRes.body.find((t: { title: string }) => t.title === '팀 회의 준비');
      expect(q1Item.overdue).toBe(true);
      expect(meetingItem.overdue).toBe(false);

      // 7. "Q1 보고서 제출" 완료 처리
      mockQuery
        .mockResolvedValueOnce({ rows: [makeTodoRow({ id: 'todo-q1', member_id: 'minjun-id', title: 'Q1 보고서 제출', due_date: pastDate, status: 'PENDING' })] })
        .mockResolvedValueOnce({ rows: [makeTodoRow({ id: 'todo-q1', member_id: 'minjun-id', title: 'Q1 보고서 제출', due_date: pastDate, status: 'DONE' })] });

      const completeRes = await request(app)
        .patch('/api/todos/todo-q1/complete')
        .set('Authorization', `Bearer ${token}`);

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.status).toBe('DONE');

      // 8. 목록 재조회: "Q1 보고서 제출" overdue:false (DONE)
      mockQuery.mockResolvedValueOnce({
        rows: [
          makeTodoRow({ id: 'todo-q1', member_id: 'minjun-id', title: 'Q1 보고서 제출', due_date: pastDate, status: 'DONE' }),
          makeTodoRow({ id: 'todo-meeting', member_id: 'minjun-id', title: '팀 회의 준비', due_date: null, status: 'PENDING' }),
        ],
      });

      const listRes2 = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${token}`);

      expect(listRes2.status).toBe(200);
      const q1After = listRes2.body.find((t: { title: string }) => t.title === 'Q1 보고서 제출');
      expect(q1After.overdue).toBe(false);
    });
  });

  // SC-E2E-02: 대학생 이수아 전체 플로우
  describe('SC-E2E-02 대학생 이수아 전체 플로우', () => {
    it('로그인→할 일 생성→목록조회(본인만)→수정→타인수정(403)→타인삭제(403)→삭제→재조회(404)', async () => {
      const now = '2026-01-01T00:00:00.000Z';
      const hashedPassword = await bcrypt.hash('sua12345', 10);
      const SOOAH_ID = 'sooah-id';
      const MINJUN_ID = 'minjun-id';
      const MINJUN_TODO_ID = 'minjun-todo-id';
      const SOOAH_TODO_ID = 'sooah-todo-id';

      // 1. 이수아 로그인
      mockQuery
        .mockResolvedValueOnce({
          rows: [{ id: SOOAH_ID, email: 'sooah@example.com', password: hashedPassword, nickname: '이수아', created_at: now }],
        })
        .mockResolvedValueOnce({ rows: [] }); // INSERT refresh_token

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'sooah@example.com', password: 'sua12345' });

      expect(loginRes.status).toBe(200);
      const token = loginRes.body.accessToken as string;

      // 2. "운영체제 과제" 생성 (dueDate=내일)
      const tomorrow = '2099-12-31';
      mockQuery.mockResolvedValueOnce({
        rows: [makeTodoRow({ id: SOOAH_TODO_ID, member_id: SOOAH_ID, title: '운영체제 과제', due_date: tomorrow })],
      });

      const createRes = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '운영체제 과제', dueDate: tomorrow });

      expect(createRes.status).toBe(201);

      // 3. 목록 조회: 이수아 항목만, 김민준 항목 미포함
      mockQuery.mockResolvedValueOnce({
        rows: [makeTodoRow({ id: SOOAH_TODO_ID, member_id: SOOAH_ID, title: '운영체제 과제', due_date: tomorrow })],
      });

      const listRes = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${token}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body).toHaveLength(1);
      expect(listRes.body[0].memberId).toBe(SOOAH_ID);
      expect(listRes.body.some((t: { memberId: string }) => t.memberId === MINJUN_ID)).toBe(false);

      // 4. 노트북 재로그인 (새 JWT 발급)
      mockQuery
        .mockResolvedValueOnce({
          rows: [{ id: SOOAH_ID, email: 'sooah@example.com', password: hashedPassword, nickname: '이수아', created_at: now }],
        })
        .mockResolvedValueOnce({ rows: [] }); // INSERT refresh_token

      const loginRes2 = await request(app)
        .post('/api/auth/login')
        .send({ email: 'sooah@example.com', password: 'sua12345' });

      expect(loginRes2.status).toBe(200);
      const token2 = loginRes2.body.accessToken as string;

      // 5. "운영체제 과제" → "운영체제 과제 (1차 제출)" 수정
      const updatedTitle = '운영체제 과제 (1차 제출)';
      mockQuery
        .mockResolvedValueOnce({ rows: [makeTodoRow({ id: SOOAH_TODO_ID, member_id: SOOAH_ID, title: '운영체제 과제' })] })
        .mockResolvedValueOnce({ rows: [makeTodoRow({ id: SOOAH_TODO_ID, member_id: SOOAH_ID, title: updatedTitle })] });

      const updateRes = await request(app)
        .patch(`/api/todos/${SOOAH_TODO_ID}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ title: updatedTitle });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.title).toBe(updatedTitle);

      // 6. 김민준 소유 할 일 수정 시도 → 403
      mockQuery.mockResolvedValueOnce({
        rows: [makeTodoRow({ id: MINJUN_TODO_ID, member_id: MINJUN_ID, title: '김민준 할 일' })],
      });

      const forbiddenUpdateRes = await request(app)
        .patch(`/api/todos/${MINJUN_TODO_ID}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ title: '내 것' });

      expect(forbiddenUpdateRes.status).toBe(403);

      // 7. 김민준 소유 할 일 삭제 시도 → 403
      mockQuery.mockResolvedValueOnce({
        rows: [makeTodoRow({ id: MINJUN_TODO_ID, member_id: MINJUN_ID, title: '김민준 할 일' })],
      });

      const forbiddenDeleteRes = await request(app)
        .delete(`/api/todos/${MINJUN_TODO_ID}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(forbiddenDeleteRes.status).toBe(403);

      // 8. 이수아 본인 할 일 삭제 → 204
      mockQuery
        .mockResolvedValueOnce({ rows: [makeTodoRow({ id: SOOAH_TODO_ID, member_id: SOOAH_ID, title: updatedTitle })] })
        .mockResolvedValueOnce({ rowCount: 1 });

      const deleteRes = await request(app)
        .delete(`/api/todos/${SOOAH_TODO_ID}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(deleteRes.status).toBe(204);

      // 9. 삭제된 항목 조회: findById가 null 반환 → 404
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const notFoundRes = await request(app)
        .patch(`/api/todos/${SOOAH_TODO_ID}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ title: '다시 수정' });

      expect(notFoundRes.status).toBe(404);
    });
  });
});

// bcrypt는 auth.test.ts와 공유되므로 여기서도 import
import bcrypt from 'bcrypt';
