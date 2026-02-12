import pool from '../config/db';
import { RefreshToken } from '../types/member.types';

export async function create(memberId: string, token: string, expiresAt: Date): Promise<void> {
  await pool.query(
    'INSERT INTO refresh_token (member_id, token, expires_at) VALUES ($1, $2, $3)',
    [memberId, token, expiresAt]
  );
}

export async function findByToken(token: string): Promise<RefreshToken | null> {
  const result = await pool.query(
    'SELECT id, member_id AS "memberId", token, expires_at AS "expiresAt", created_at AS "createdAt" FROM refresh_token WHERE token = $1',
    [token]
  );
  return result.rows[0] ?? null;
}

export async function deleteByToken(token: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM refresh_token WHERE token = $1', [token]);
  return (result.rowCount ?? 0) > 0;
}

export async function deleteByMemberId(memberId: string): Promise<void> {
  await pool.query('DELETE FROM refresh_token WHERE member_id = $1', [memberId]);
}
