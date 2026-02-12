import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TodoListPage from '../../pages/TodoListPage';
import * as todoService from '../../services/todoService';
import * as authService from '../../services/authService';

vi.mock('../../services/todoService');
vi.mock('../../services/authService');

const mockGetAll = vi.mocked(todoService.getAll);
const mockLogout = vi.mocked(authService.logout);

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
  mockLogout.mockResolvedValue(undefined);
  vi.stubGlobal('confirm', vi.fn(() => false));
});

const makeTodo = (overrides = {}) => ({
  id: 'todo-1',
  memberId: 'member-1',
  title: '테스트 할 일',
  description: null,
  dueDate: null,
  status: 'PENDING' as const,
  createdAt: '2026-02-12T00:00:00Z',
  updatedAt: '2026-02-12T00:00:00Z',
  overdue: false,
  ...overrides,
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <TodoListPage />
    </MemoryRouter>,
  );

describe('TodoListPage', () => {
  it('로딩 중 메시지 표시', () => {
    mockGetAll.mockImplementation(() => new Promise(() => {}));
    renderPage();
    expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
  });

  it('할 일 목록 렌더링', async () => {
    mockGetAll.mockResolvedValueOnce([makeTodo()]);
    renderPage();
    await waitFor(() => expect(screen.getByText('테스트 할 일')).toBeInTheDocument());
  });

  it('빈 목록 시 안내 메시지 표시', async () => {
    mockGetAll.mockResolvedValueOnce([]);
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('할 일이 없습니다. 추가해보세요!')).toBeInTheDocument(),
    );
  });

  it('getAll 실패 시 에러 메시지 표시', async () => {
    mockGetAll.mockRejectedValueOnce(new Error('Network'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('할 일 목록을 불러오는데 실패했습니다.')).toBeInTheDocument(),
    );
  });

  it('헤더에 + 할 일 추가 버튼 존재', async () => {
    mockGetAll.mockResolvedValueOnce([]);
    renderPage();
    await waitFor(() => expect(screen.getByText('+ 할 일 추가')).toBeInTheDocument());
  });

  it('헤더에 로그아웃 버튼 존재', async () => {
    mockGetAll.mockResolvedValueOnce([]);
    renderPage();
    await waitFor(() => expect(screen.getByText('로그아웃')).toBeInTheDocument());
  });

  it('Overdue 항목에 마감 초과 배지 표시', async () => {
    mockGetAll.mockResolvedValueOnce([makeTodo({ overdue: true, status: 'PENDING' })]);
    renderPage();
    await waitFor(() => expect(screen.getByText('마감 초과')).toBeInTheDocument());
  });

  it('DONE 항목 제목에 취소선 클래스 적용', async () => {
    mockGetAll.mockResolvedValueOnce([makeTodo({ status: 'DONE' })]);
    renderPage();
    await waitFor(() => {
      const title = screen.getByText('테스트 할 일');
      expect(title).toHaveClass('todo-item__title--done');
    });
  });

  it('로그아웃 버튼 클릭 시 logout 호출 및 /login 이동', async () => {
    mockGetAll.mockResolvedValueOnce([]);
    renderPage();
    await waitFor(() => expect(screen.getByText('로그아웃')).toBeInTheDocument());

    fireEvent.click(screen.getByText('로그아웃'));
    await waitFor(() => expect(mockLogout).toHaveBeenCalled());
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
  });

  it('+ 할 일 추가 버튼 클릭 시 /todos/new 이동', async () => {
    mockGetAll.mockResolvedValueOnce([]);
    renderPage();
    await waitFor(() => expect(screen.getByText('+ 할 일 추가')).toBeInTheDocument());
    fireEvent.click(screen.getByText('+ 할 일 추가'));
    expect(mockNavigate).toHaveBeenCalledWith('/todos/new');
  });
});
