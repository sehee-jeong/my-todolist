import pool from '../config/db';
import { Member, MemberPublic } from '../types/member.types';

export async function findByEmail(email: string): Promise<Member | null> {
  const result = await pool.query<Member>(
    `SELECT id, email, password, nickname, created_at AS "createdAt"
     FROM member WHERE email = $1`,
    [email],
  );
  return result.rows[0] ?? null;
}

export async function create(data: {
  email: string;
  password: string;
  nickname: string;
}): Promise<MemberPublic> {
  const result = await pool.query<MemberPublic>(
    `INSERT INTO member (email, password, nickname)
     VALUES ($1, $2, $3)
     RETURNING id, email, nickname, created_at AS "createdAt"`,
    [data.email, data.password, data.nickname],
  );
  return result.rows[0];
}
