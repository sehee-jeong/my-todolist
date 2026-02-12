export interface Member {
  id: string;
  email: string;
  password: string;
  nickname: string;
  createdAt: string;
}

export interface MemberPublic {
  id: string;
  email: string;
  nickname: string;
  createdAt: string;
}

export interface SignupDto {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshToken {
  id: string;
  memberId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshDto {
  refreshToken: string;
}

export interface LogoutDto {
  refreshToken: string;
}
