import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TodoNewPage from '../../pages/TodoNewPage';
import * as todoService from '../../services/todoService';

vi.mock('../../services/todoService');

const mockCreate = vi.mocked(todoService.create);

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

const renderPage = () =>
  render(
    <MemoryRouter>
      <TodoNewPage />
    </MemoryRouter>,
  );

const makeTodo = (overrides = {}) => ({
  id: 'todo-1',
  memberId: 'member-1',
  title: '새 할 일',
  description: null,
  dueDate: null,
  status: 'PENDING' as const,
  createdAt: '2026-02-12T00:00:00Z',
  updatedAt: '2026-02-12T00:00:00Z',
  overdue: false,
  ...overrides,
});

describe('TodoNewPage', () => {
  it('제목·설명·마감일 필드 렌더링', () => {
    renderPage();
    expect(screen.getByLabelText('제목 *')).toBeInTheDocument();
    expect(screen.getByLabelText('설명 (선택)')).toBeInTheDocument();
    expect(screen.getByLabelText('마감일 (선택)')).toBeInTheDocument();
  });

  it('빈 제목(공백)으로 직접 제출 시 오류 메시지 + API 미호출', async () => {
    renderPage();
    // required 속성이 있어서 직접 form submit 이벤트를 통해 검사
    const form = screen.getByRole('button', { name: '저장' }).closest('form')!;
    const titleInput = screen.getByLabelText('제목 *') as HTMLInputElement;
    // 공백만 입력
    fireEvent.change(titleInput, { target: { value: '   ' } });
    fireEvent.submit(form);
    await waitFor(() =>
      expect(screen.getByText('제목을 입력해주세요.')).toBeInTheDocument(),
    );
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('제목만 입력해도 생성 가능', async () => {
    mockCreate.mockResolvedValueOnce(makeTodo());
    renderPage();
    fireEvent.change(screen.getByLabelText('제목 *'), { target: { value: '새 할 일' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() => expect(mockCreate).toHaveBeenCalledWith({ title: '새 할 일' }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });

  it('제목·설명·마감일 모두 입력해서 생성', async () => {
    mockCreate.mockResolvedValueOnce(makeTodo({ description: '설명', dueDate: '2026-02-20T10:00' }));
    renderPage();
    fireEvent.change(screen.getByLabelText('제목 *'), { target: { value: '새 할 일' } });
    fireEvent.change(screen.getByLabelText('설명 (선택)'), { target: { value: '설명' } });
    fireEvent.change(screen.getByLabelText('마감일 (선택)'), { target: { value: '2026-02-20T10:00' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() =>
      expect(mockCreate).toHaveBeenCalledWith({
        title: '새 할 일',
        description: '설명',
        dueDate: '2026-02-20T10:00',
      }),
    );
  });

  it('생성 실패 시 오류 메시지 표시', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Network'));
    renderPage();
    fireEvent.change(screen.getByLabelText('제목 *'), { target: { value: '새 할 일' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() =>
      expect(screen.getByText('할 일 생성에 실패했습니다.')).toBeInTheDocument(),
    );
  });

  it('취소 버튼 클릭 시 / 이동', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('저장 중 버튼 비활성화', async () => {
    mockCreate.mockImplementation(() => new Promise(() => {}));
    renderPage();
    fireEvent.change(screen.getByLabelText('제목 *'), { target: { value: '새 할 일' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '저장 중...' })).toBeDisabled(),
    );
  });
});
