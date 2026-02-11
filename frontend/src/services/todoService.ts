import apiClient from './apiClient';
import type { Todo, CreateTodoDto, UpdateTodoDto } from '../types/todo.types';

export function getAll(): Promise<Todo[]> {
  return apiClient.request<Todo[]>('/todos');
}

export function create(dto: CreateTodoDto): Promise<Todo> {
  return apiClient.request<Todo>('/todos', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function update(id: string, dto: UpdateTodoDto): Promise<Todo> {
  return apiClient.request<Todo>(`/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

export function remove(id: string): Promise<void> {
  return apiClient.request<void>(`/todos/${id}`, { method: 'DELETE' });
}

export function complete(id: string): Promise<Todo> {
  return apiClient.request<Todo>(`/todos/${id}/complete`, { method: 'PATCH' });
}

export function revert(id: string): Promise<Todo> {
  return apiClient.request<Todo>(`/todos/${id}/revert`, { method: 'PATCH' });
}
