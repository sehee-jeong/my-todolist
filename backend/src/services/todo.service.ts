import * as todoRepo from '../repositories/todo.repository';
import { Todo, CreateTodoDto, UpdateTodoDto } from '../types/todo.types';
import { createError } from '../shared/errors';

function withOverdue(todo: Omit<Todo, 'overdue'>): Todo {
  const now = new Date();
  const overdue =
    todo.status === 'PENDING' &&
    todo.dueDate !== null &&
    new Date(todo.dueDate) < now;
  return { ...todo, overdue };
}

async function findOwnedTodo(id: string, memberId: string): Promise<Omit<Todo, 'overdue'>> {
  const existing = await todoRepo.findById(id);
  if (!existing) throw createError('Not found', 404);
  if (existing.memberId !== memberId) throw createError('Forbidden', 403);
  return existing;
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
  await findOwnedTodo(id, memberId);
  const updated = await todoRepo.update(id, dto);
  return withOverdue(updated!);
}

export async function remove(memberId: string, id: string): Promise<void> {
  await findOwnedTodo(id, memberId);
  await todoRepo.deleteById(id);
}

export async function complete(memberId: string, id: string): Promise<Todo> {
  const existing = await findOwnedTodo(id, memberId);
  if (existing.status === 'DONE') throw createError('Already done', 400);

  const updated = await todoRepo.updateStatus(id, 'DONE');
  return withOverdue(updated!);
}

export async function revert(memberId: string, id: string): Promise<Todo> {
  const existing = await findOwnedTodo(id, memberId);
  if (existing.status === 'PENDING') throw createError('Already pending', 400);

  const updated = await todoRepo.updateStatus(id, 'PENDING');
  return withOverdue(updated!);
}
