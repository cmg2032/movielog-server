import { Member } from '../entity/member.entity.js';

// 응답에는 password 필드 자체가 없습니다. 엔티티를 그대로 돌려주지 않는 이유입니다.
export class MemberResponseDto {
  memberId: number;
  email: string;
  nickname: string;
  createdAt: Date;

  static from(member: Member): MemberResponseDto {
    return {
      memberId: member.memberId,
      email: member.email,
      nickname: member.nickname,
      createdAt: member.createdAt,
    };
  }
}
