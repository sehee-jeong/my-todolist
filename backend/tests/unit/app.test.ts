import request from 'supertest';

jest.mock('../../src/config/db', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
    on: jest.fn(),
  },
}));

import app from '../../src/app';
import pool from '../../src/config/db';

const mockQueryFn = pool.query as jest.Mock;

describe('Express app (BE-01)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('returns 200 with { status: "ok" }', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('JSON body parser', () => {
    it('parses application/json request bodies', async () => {
      // When JSON is malformed, Express returns 400 "SyntaxError" before hitting any route.
      // Sending valid JSON proves the parser is active; the route handler receives the parsed body.
      // POST /api/auth/signup with an invalid email triggers a 400 from business logic (not a parse error).
      const res = await request(app)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send('{"email":"not-an-email","password":"pass1234","nickname":"tester"}');

      // 400 from business logic means the body was parsed successfully.
      // A JSON syntax error from express.json() would also be 400 but with a SyntaxError message.
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid email format');
    });
  });

  describe('global error handler', () => {
    it('returns client error status and message for 4xx errors', async () => {
      // auth.service.signup throws { status: 400, message: 'Invalid email format' }
      // which the controller passes to next(err), reaching the global error handler.
      const res = await request(app)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send({ email: 'bad-email', password: 'pass1234', nickname: 'tester' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Invalid email format' });
    });

    it('returns 500 with generic message when an unexpected error occurs', async () => {
      // Make pool.query throw an unexpected error (no .status property).
      mockQueryFn.mockRejectedValueOnce(new Error('DB connection lost'));

      const res = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: 'user@example.com', password: 'pass1234' });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Internal Server Error' });
    });
  });

  describe('unknown routes', () => {
    it('returns 404 for a route that does not exist', async () => {
      const res = await request(app).get('/this-route-does-not-exist');
      expect(res.status).toBe(404);
    });
  });
});
