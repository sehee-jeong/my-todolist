import { Member, MemberPublic } from '../../types/member.types';

export interface IMemberRepository {
  findByEmail(email: string): Promise<Member | null>;
  create(data: { email: string; password: string; nickname: string }): Promise<MemberPublic>;
}
