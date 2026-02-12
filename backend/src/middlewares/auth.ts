import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from '../shared/errors';
import { getJwtSecret } from '../config/env';

declare global {
  namespace Express {
    interface Request {
      memberId: string;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(createError('Unauthorized', 401));
  }

  const token = authHeader.slice(7);
  try {
    const secret = getJwtSecret();
    const payload = jwt.verify(token, secret) as { memberId: string };
    req.memberId = payload.memberId;
    next();
  } catch (err: unknown) {
    const structured = err as { status?: number };
    next(structured.status ? err : createError('Unauthorized', 401));
  }
}
