import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as memberRepo from '../repositories/member.repository';
import * as refreshTokenRepo from '../repositories/refresh-token.repository';
import { SignupDto, LoginDto, MemberPublic, AuthTokens, RefreshDto, LogoutDto } from '../types/member.types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

function createError(message: string, status: number): Error & { status: number } {
  const err = new Error(message) as Error & { status: number };
  err.status = status;
  return err;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  return secret;
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

export async function login(dto: LoginDto): Promise<AuthTokens> {
  const member = await memberRepo.findByEmail(dto.email);
  if (!member) {
    throw createError('Invalid credentials', 401);
  }

  const valid = await bcrypt.compare(dto.password, member.password);
  if (!valid) {
    throw createError('Invalid credentials', 401);
  }

  const secret = getJwtSecret();
  const accessToken = jwt.sign({ memberId: member.id }, secret, { expiresIn: '15m' });

  const refreshTokenValue = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await refreshTokenRepo.create(member.id, refreshTokenValue, expiresAt);

  return { accessToken, refreshToken: refreshTokenValue };
}

export async function refresh(dto: RefreshDto): Promise<AuthTokens> {
  const stored = await refreshTokenRepo.findByToken(dto.refreshToken);
  if (!stored) {
    throw createError('Invalid refresh token', 401);
  }

  if (new Date(stored.expiresAt) < new Date()) {
    await refreshTokenRepo.deleteByToken(dto.refreshToken);
    throw createError('Refresh token expired', 401);
  }

  await refreshTokenRepo.deleteByToken(dto.refreshToken);

  const secret = getJwtSecret();
  const accessToken = jwt.sign({ memberId: stored.memberId }, secret, { expiresIn: '15m' });

  const newRefreshToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await refreshTokenRepo.create(stored.memberId, newRefreshToken, expiresAt);

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(dto: LogoutDto): Promise<void> {
  await refreshTokenRepo.deleteByToken(dto.refreshToken);
}
