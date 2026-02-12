import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TodoEditPage from '../../pages/TodoEditPage';
import * as todoService from '../../services/todoService';

vi.mock('../../services/todoService');

const mockGetAll = vi.mocked(todoService.getAll);
const mockUpdate = vi.mocked(todoService.update);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

const existingTodo = {
  id: 'todo-1',
  memberId: 'member-1',
  title: '기존 제목',
  description: '기존 설명',
  dueDate: '2026-02-20',
  status: 'PENDING' as const,
  createdAt: '2026-02-12T00:00:00Z',
  updatedAt: '2026-02-12T00:00:00Z',
  overdue: false,
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/todos/todo-1/edit']}>
      <Routes>
        <Route path="/todos/:id/edit" element={<TodoEditPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe('TodoEditPage', () => {
  it('기존 값으로 필드 초기화', async () => {
    mockGetAll.mockResolvedValueOnce([existingTodo]);
    renderPage();
    await waitFor(() =>
      expect((screen.getByLabelText('제목 *') as HTMLInputElement).value).toBe('기존 제목'),
    );
    expect((screen.getByLabelText('설명 (선택)') as HTMLTextAreaElement).value).toBe('기존 설명');
    expect((screen.getByLabelText('마감일 (선택)') as HTMLInputElement).value).toBe('2026-02-20T00:00');
  });

  it('todo를 찾지 못하면 / 이동', async () => {
    mockGetAll.mockResolvedValueOnce([]);
    renderPage();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });

  it('수정 성공 시 / 이동', async () => {
    mockGetAll.mockResolvedValueOnce([existingTodo]);
    mockUpdate.mockResolvedValueOnce({ ...existingTodo, title: '수정된 제목' });

    renderPage();
    await waitFor(() =>
      expect((screen.getByLabelText('제목 *') as HTMLInputElement).value).toBe('기존 제목'),
    );

    fireEvent.change(screen.getByLabelText('제목 *'), { target: { value: '수정된 제목' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });

  it('403 오류 시 접근 권한 에러 메시지 표시', async () => {
    mockGetAll.mockResolvedValueOnce([existingTodo]);
    mockUpdate.mockRejectedValueOnce({ status: 403 });

    renderPage();
    await waitFor(() =>
      expect((screen.getByLabelText('제목 *') as HTMLInputElement).value).toBe('기존 제목'),
    );

    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() =>
      expect(screen.getByText('접근 권한이 없습니다.')).toBeInTheDocument(),
    );
  });

  it('기타 오류 시 수정 실패 메시지 표시', async () => {
    mockGetAll.mockResolvedValueOnce([existingTodo]);
    mockUpdate.mockRejectedValueOnce(new Error('Network'));

    renderPage();
    await waitFor(() =>
      expect((screen.getByLabelText('제목 *') as HTMLInputElement).value).toBe('기존 제목'),
    );

    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() => expect(screen.getByText('수정에 실패했습니다.')).toBeInTheDocument());
  });

  it('빈 제목(공백)으로 제출 시 오류 메시지', async () => {
    mockGetAll.mockResolvedValueOnce([existingTodo]);

    renderPage();
    await waitFor(() =>
      expect((screen.getByLabelText('제목 *') as HTMLInputElement).value).toBe('기존 제목'),
    );

    fireEvent.change(screen.getByLabelText('제목 *'), { target: { value: '   ' } });
    const form = screen.getByRole('button', { name: '저장' }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() =>
      expect(screen.getByText('제목을 입력해주세요.')).toBeInTheDocument(),
    );
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('취소 버튼 클릭 시 / 이동', async () => {
    mockGetAll.mockResolvedValueOnce([existingTodo]);
    renderPage();
    await waitFor(() =>
      expect((screen.getByLabelText('제목 *') as HTMLInputElement).value).toBe('기존 제목'),
    );
    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
