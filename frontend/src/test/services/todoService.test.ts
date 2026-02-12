import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as todoService from '../../services/todoService';
import apiClient from '../../services/apiClient';

vi.mock('../../services/apiClient', () => ({
  default: {
    request: vi.fn(),
  },
}));

const mockRequest = vi.mocked(apiClient.request);

beforeEach(() => {
  vi.clearAllMocks();
});

const mockTodo = {
  id: 'todo-1',
  memberId: 'member-1',
  title: '테스트 할 일',
  description: null,
  dueDate: null,
  status: 'PENDING' as const,
  createdAt: '2026-02-12T00:00:00Z',
  updatedAt: '2026-02-12T00:00:00Z',
  overdue: false,
};

describe('todoService', () => {
  it('getAll: GET /todos 호출', async () => {
    mockRequest.mockResolvedValueOnce([mockTodo]);
    const result = await todoService.getAll();
    expect(mockRequest).toHaveBeenCalledWith('/todos');
    expect(result).toEqual([mockTodo]);
  });

  it('create: POST /todos 호출', async () => {
    mockRequest.mockResolvedValueOnce(mockTodo);
    const dto = { title: '테스트', description: '설명', dueDate: '2026-02-20' };
    await todoService.create(dto);
    expect(mockRequest).toHaveBeenCalledWith('/todos', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  });

  it('update: PATCH /todos/:id 호출', async () => {
    mockRequest.mockResolvedValueOnce({ ...mockTodo, title: '수정됨' });
    await todoService.update('todo-1', { title: '수정됨' });
    expect(mockRequest).toHaveBeenCalledWith('/todos/todo-1', {
      method: 'PATCH',
      body: JSON.stringify({ title: '수정됨' }),
    });
  });

  it('remove: DELETE /todos/:id 호출', async () => {
    mockRequest.mockResolvedValueOnce(undefined);
    await todoService.remove('todo-1');
    expect(mockRequest).toHaveBeenCalledWith('/todos/todo-1', { method: 'DELETE' });
  });

  it('complete: PATCH /todos/:id/complete 호출', async () => {
    mockRequest.mockResolvedValueOnce({ ...mockTodo, status: 'DONE' });
    await todoService.complete('todo-1');
    expect(mockRequest).toHaveBeenCalledWith('/todos/todo-1/complete', { method: 'PATCH' });
  });

  it('revert: PATCH /todos/:id/revert 호출', async () => {
    mockRequest.mockResolvedValueOnce(mockTodo);
    await todoService.revert('todo-1');
    expect(mockRequest).toHaveBeenCalledWith('/todos/todo-1/revert', { method: 'PATCH' });
  });
});
