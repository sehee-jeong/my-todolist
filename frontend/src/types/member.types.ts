export interface SignupDto {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}
