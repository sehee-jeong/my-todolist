import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTodos } from '../../hooks/useTodos';
import * as todoService from '../../services/todoService';

vi.mock('../../services/todoService');

const mockGetAll = vi.mocked(todoService.getAll);
const mockComplete = vi.mocked(todoService.complete);
const mockRevert = vi.mocked(todoService.revert);
const mockRemove = vi.mocked(todoService.remove);

const makeTodo = (overrides = {}) => ({
  id: 'todo-1',
  memberId: 'member-1',
  title: '테스트',
  description: null,
  dueDate: null,
  status: 'PENDING' as const,
  createdAt: '2026-02-12T00:00:00Z',
  updatedAt: '2026-02-12T00:00:00Z',
  overdue: false,
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('alert', vi.fn());
  vi.stubGlobal('confirm', vi.fn(() => true));
});

describe('useTodos', () => {
  it('마운트 시 할 일 목록 로드', async () => {
    mockGetAll.mockResolvedValueOnce([makeTodo()]);

    const { result } = renderHook(() => useTodos());
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].title).toBe('테스트');
  });

  it('getAll 실패 시 error 메시지 설정', async () => {
    mockGetAll.mockRejectedValueOnce(new Error('Network'));

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('할 일 목록을 불러오는데 실패했습니다.');
  });

  it('handleComplete: DONE으로 상태 변경', async () => {
    const pending = makeTodo({ status: 'PENDING' });
    const done = makeTodo({ status: 'DONE' });
    mockGetAll.mockResolvedValueOnce([pending]);
    mockComplete.mockResolvedValueOnce(done);

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleComplete('todo-1');
    });

    expect(result.current.todos[0].status).toBe('DONE');
  });

  it('handleComplete: 400 오류 시 alert 표시', async () => {
    mockGetAll.mockResolvedValueOnce([makeTodo({ status: 'DONE' })]);
    mockComplete.mockRejectedValueOnce({ status: 400 });

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleComplete('todo-1');
    });

    expect(window.alert).toHaveBeenCalledWith('이미 완료된 항목입니다.');
  });

  it('handleRevert: PENDING으로 상태 변경', async () => {
    const done = makeTodo({ status: 'DONE' });
    const pending = makeTodo({ status: 'PENDING' });
    mockGetAll.mockResolvedValueOnce([done]);
    mockRevert.mockResolvedValueOnce(pending);

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleRevert('todo-1');
    });

    expect(result.current.todos[0].status).toBe('PENDING');
  });

  it('handleRevert: 400 오류 시 alert 표시', async () => {
    mockGetAll.mockResolvedValueOnce([makeTodo({ status: 'PENDING' })]);
    mockRevert.mockRejectedValueOnce({ status: 400 });

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleRevert('todo-1');
    });

    expect(window.alert).toHaveBeenCalledWith('이미 미완료 상태입니다.');
  });

  it('handleRemove: confirm 후 할 일 삭제', async () => {
    mockGetAll.mockResolvedValueOnce([makeTodo()]);
    mockRemove.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleRemove('todo-1');
    });

    expect(result.current.todos).toHaveLength(0);
  });

  it('handleRemove: confirm 취소 시 삭제 안 함', async () => {
    vi.stubGlobal('confirm', vi.fn(() => false));
    mockGetAll.mockResolvedValueOnce([makeTodo()]);

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleRemove('todo-1');
    });

    expect(mockRemove).not.toHaveBeenCalled();
    expect(result.current.todos).toHaveLength(1);
  });

  it('handleRemove: 삭제 실패 시 alert 표시', async () => {
    mockGetAll.mockResolvedValueOnce([makeTodo()]);
    mockRemove.mockRejectedValueOnce(new Error('Network'));

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleRemove('todo-1');
    });

    expect(window.alert).toHaveBeenCalledWith('삭제에 실패했습니다.');
  });
});
