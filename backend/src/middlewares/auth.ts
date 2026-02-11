import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      memberId: string;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ message: 'Internal Server Error' });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as { memberId: string };
    req.memberId = payload.memberId;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
}
