import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignupPage from '../../pages/SignupPage';
import * as authService from '../../services/authService';

vi.mock('../../services/authService');

const mockSignup = vi.mocked(authService.signup);
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
      <SignupPage />
    </MemoryRouter>,
  );

describe('SignupPage', () => {
  it('이메일·비밀번호·닉네임 입력 필드 렌더링', () => {
    renderPage();
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
    expect(screen.getByLabelText('닉네임')).toBeInTheDocument();
  });

  it('로그인 링크 존재', () => {
    renderPage();
    expect(screen.getByText('로그인')).toBeInTheDocument();
  });

  it('가입 성공 시 /login 이동', async () => {
    mockSignup.mockResolvedValueOnce(undefined);

    renderPage();
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'new@test.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'pass1234' } });
    fireEvent.change(screen.getByLabelText('닉네임'), { target: { value: '홍길동' } });
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
  });

  it('409 중복 이메일 에러 메시지 표시', async () => {
    mockSignup.mockRejectedValueOnce({ status: 409 });

    renderPage();
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'dup@test.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'pass1234' } });
    fireEvent.change(screen.getByLabelText('닉네임'), { target: { value: '중복' } });
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));

    await waitFor(() =>
      expect(screen.getByText('이미 사용 중인 이메일입니다.')).toBeInTheDocument(),
    );
  });

  it('400 오류 시 서버 메시지 표시', async () => {
    mockSignup.mockRejectedValueOnce({ status: 400, message: '비밀번호 정책 미충족' });

    renderPage();
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'weak' } });
    fireEvent.change(screen.getByLabelText('닉네임'), { target: { value: '테스트' } });
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));

    await waitFor(() =>
      expect(screen.getByText('비밀번호 정책 미충족')).toBeInTheDocument(),
    );
  });

  it('이미 로그인된 경우 / 리다이렉트', () => {
    mockGetToken.mockReturnValue('existing-token');
    renderPage();
    expect(screen.queryByLabelText('이메일')).not.toBeInTheDocument();
  });

  it('제출 중 버튼 비활성화', async () => {
    mockSignup.mockImplementation(() => new Promise(() => {}));

    renderPage();
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'pass1234' } });
    fireEvent.change(screen.getByLabelText('닉네임'), { target: { value: '테스트' } });
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: '처리 중...' })).toBeDisabled(),
    );
  });
});
