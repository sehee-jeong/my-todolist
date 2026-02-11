import { Request, Response, NextFunction } from 'express';
import * as todoService from '../services/todo.service';

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const todos = await todoService.getAll(req.memberId);
    res.status(200).json(todos);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const todo = await todoService.create(req.memberId, req.body);
    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const todo = await todoService.update(req.memberId, req.params.id, req.body);
    res.status(200).json(todo);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await todoService.remove(req.memberId, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function complete(req: Request, res: Response, next: NextFunction) {
  try {
    const todo = await todoService.complete(req.memberId, req.params.id);
    res.status(200).json(todo);
  } catch (err) {
    next(err);
  }
}

export async function revert(req: Request, res: Response, next: NextFunction) {
  try {
    const todo = await todoService.revert(req.memberId, req.params.id);
    res.status(200).json(todo);
  } catch (err) {
    next(err);
  }
}
