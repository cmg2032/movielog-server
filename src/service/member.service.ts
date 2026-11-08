import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Member } from '../entity/member.entity.js';
import { CheckResponseDto } from '../dto/check-response.dto.js';
import { CreateMemberDto } from '../dto/create-member.dto.js';
import { MemberResponseDto } from '../dto/member-response.dto.js';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  async checkNickname(nickname: string): Promise<CheckResponseDto> {
    const exists = await this.memberRepository.exists({ where: { nickname } });
    return { available: !exists };
  }

  async checkEmail(email: string): Promise<CheckResponseDto> {
    const exists = await this.memberRepository.exists({ where: { email } });
    return { available: !exists };
  }

  async signUp(dto: CreateMemberDto): Promise<MemberResponseDto> {
    if (await this.memberRepository.exists({ where: { email: dto.email } })) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }
    if (
      await this.memberRepository.exists({ where: { nickname: dto.nickname } })
    ) {
      throw new ConflictException('이미 사용 중인 닉네임입니다.');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const saved = await this.memberRepository.save(
      this.memberRepository.create({
        email: dto.email,
        nickname: dto.nickname,
        password: hashed,
      }),
    );

    return MemberResponseDto.from(saved);
  }
}
