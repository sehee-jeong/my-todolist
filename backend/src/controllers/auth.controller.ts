import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const member = await authService.signup(req.body);
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
