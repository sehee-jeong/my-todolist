import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';
import * as authService from '../../services/authService';

vi.mock('../../services/authService');

const mockLogin = vi.mocked(authService.login);
const mockGetToken = vi.mocked(authService.getToken);

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
  mockGetToken.mockReturnValue(null);
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );

describe('LoginPage', () => {
  it('이메일·비밀번호 입력 필드 렌더링', () => {
    renderPage();
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
  });

  it('회원가입 링크 존재', () => {
    renderPage();
    expect(screen.getByRole('link', { name: '회원가입' })).toBeInTheDocument();
  });

  it('로그인 성공 시 / 이동', async () => {
    mockLogin.mockResolvedValueOnce({ accessToken: 'access', refreshToken: 'refresh' });

    renderPage();
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'pass1234' } });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });

  it('401 오류 시 인라인 에러 메시지 표시', async () => {
    mockLogin.mockRejectedValueOnce({ status: 401 });

    renderPage();
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() =>
      expect(
        screen.getByText('이메일 또는 비밀번호가 올바르지 않습니다.'),
      ).toBeInTheDocument(),
    );
  });

  it('네트워크 오류 시 일반 에러 메시지 표시', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Network'));

    renderPage();
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'pass1234' } });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() =>
      expect(screen.getByText('로그인에 실패했습니다. 다시 시도해주세요.')).toBeInTheDocument(),
    );
  });

  it('이미 로그인된 경우 / 리다이렉트', () => {
    mockGetToken.mockReturnValue('existing-token');
    renderPage();
    expect(screen.queryByLabelText('이메일')).not.toBeInTheDocument();
  });

  it('제출 중 버튼 비활성화', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {}));

    renderPage();
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'pass1234' } });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => expect(screen.getByRole('button', { name: '처리 중...' })).toBeDisabled());
  });
});
