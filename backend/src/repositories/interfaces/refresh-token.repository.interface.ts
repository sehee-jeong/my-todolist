import { RefreshToken } from '../../types/member.types';

export interface IRefreshTokenRepository {
  create(memberId: string, token: string, expiresAt: Date): Promise<void>;
  findByToken(token: string): Promise<RefreshToken | null>;
  deleteByToken(token: string): Promise<boolean>;
  deleteByMemberId(memberId: string): Promise<void>;
}
