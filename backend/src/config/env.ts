import { createError } from '../shared/errors';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw createError('JWT_SECRET not configured', 500);
  return secret;
}
