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
