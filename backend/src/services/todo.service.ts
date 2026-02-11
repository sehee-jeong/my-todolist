import * as todoRepo from '../repositories/todo.repository';
import { Todo, CreateTodoDto, UpdateTodoDto } from '../types/todo.types';

function createError(message: string, status: number): Error & { status: number } {
  const err = new Error(message) as Error & { status: number };
  err.status = status;
  return err;
}

function withOverdue(todo: Omit<Todo, 'overdue'>): Todo {
  const today = new Date(new Date().toDateString());
  const overdue =
    todo.status === 'PENDING' &&
    todo.dueDate !== null &&
    new Date(todo.dueDate) < today;
  return { ...todo, overdue };
}

export async function getAll(memberId: string): Promise<Todo[]> {
  const todos = await todoRepo.findAllByMemberId(memberId);
  return todos.map(withOverdue);
}

export async function create(memberId: string, dto: CreateTodoDto): Promise<Todo> {
  if (!dto.title?.trim()) {
    throw createError('Title is required', 400);
  }
  const todo = await todoRepo.create(memberId, dto);
  return withOverdue(todo);
}

export async function update(memberId: string, id: string, dto: UpdateTodoDto): Promise<Todo> {
  const existing = await todoRepo.findById(id);
  if (!existing) throw createError('Not found', 404);
  if (existing.memberId !== memberId) throw createError('Forbidden', 403);

  const updated = await todoRepo.update(id, dto);
  return withOverdue(updated!);
}

export async function remove(memberId: string, id: string): Promise<void> {
  const existing = await todoRepo.findById(id);
  if (!existing) throw createError('Not found', 404);
  if (existing.memberId !== memberId) throw createError('Forbidden', 403);

  await todoRepo.deleteById(id);
}

export async function complete(memberId: string, id: string): Promise<Todo> {
  const existing = await todoRepo.findById(id);
  if (!existing) throw createError('Not found', 404);
  if (existing.memberId !== memberId) throw createError('Forbidden', 403);
  if (existing.status === 'DONE') throw createError('Already done', 400);

  const updated = await todoRepo.updateStatus(id, 'DONE');
  return withOverdue(updated!);
}

export async function revert(memberId: string, id: string): Promise<Todo> {
  const existing = await todoRepo.findById(id);
  if (!existing) throw createError('Not found', 404);
  if (existing.memberId !== memberId) throw createError('Forbidden', 403);
  if (existing.status === 'PENDING') throw createError('Already pending', 400);

  const updated = await todoRepo.updateStatus(id, 'PENDING');
  return withOverdue(updated!);
}
