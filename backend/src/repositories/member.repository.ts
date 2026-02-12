import pool from '../config/db';
import { Member, MemberPublic } from '../types/member.types';

type MemberRow = {
  id: string;
  email: string;
  password: string;
  nickname: string;
  created_at: string;
};

type MemberPublicRow = {
  id: string;
  email: string;
  nickname: string;
  created_at: string;
};

function toMember(row: MemberRow): Member {
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    nickname: row.nickname,
    createdAt: row.created_at,
  };
}

function toMemberPublic(row: MemberPublicRow): MemberPublic {
  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    createdAt: row.created_at,
  };
}

export async function findByEmail(email: string): Promise<Member | null> {
  const result = await pool.query<MemberRow>(
    'SELECT id, email, password, nickname, created_at FROM member WHERE email = $1',
    [email],
  );
  return result.rows[0] ? toMember(result.rows[0]) : null;
}

export async function create(data: {
  email: string;
  password: string;
  nickname: string;
}): Promise<MemberPublic> {
  const result = await pool.query<MemberPublicRow>(
    `INSERT INTO member (email, password, nickname)
     VALUES ($1, $2, $3)
     RETURNING id, email, nickname, created_at`,
    [data.email, data.password, data.nickname],
  );
  return toMemberPublic(result.rows[0]);
}
