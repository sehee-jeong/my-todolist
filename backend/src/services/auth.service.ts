import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as memberRepo from '../repositories/member.repository';
import { SignupDto, LoginDto, MemberPublic } from '../types/member.types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

function createError(message: string, status: number): Error & { status: number } {
  const err = new Error(message) as Error & { status: number };
  err.status = status;
  return err;
}

export async function signup(dto: SignupDto): Promise<MemberPublic> {
  if (!EMAIL_REGEX.test(dto.email)) {
    throw createError('Invalid email format', 400);
  }
  if (!PASSWORD_REGEX.test(dto.password)) {
    throw createError('Password must be at least 8 characters with letters and numbers', 400);
  }

  const existing = await memberRepo.findByEmail(dto.email);
  if (existing) {
    throw createError('Email already in use', 409);
  }

  const hashedPassword = await bcrypt.hash(dto.password, 10);
  return memberRepo.create({ email: dto.email, password: hashedPassword, nickname: dto.nickname });
}

export async function login(dto: LoginDto): Promise<{ token: string }> {
  const member = await memberRepo.findByEmail(dto.email);
  if (!member) {
    throw createError('Invalid credentials', 401);
  }

  const valid = await bcrypt.compare(dto.password, member.password);
  if (!valid) {
    throw createError('Invalid credentials', 401);
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');

  const token = jwt.sign({ memberId: member.id }, secret, { expiresIn: '24h' });
  return { token };
}
