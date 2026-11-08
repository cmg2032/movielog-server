import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { MemberService } from '../service/member.service.js';
import { CreateMemberDto } from '../dto/create-member.dto.js';
import { ApiResponse } from '../common/api-response.js';

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get('nickname/:nickname')
  async checkNickname(@Param('nickname') nickname: string) {
    return ApiResponse.ok(await this.memberService.checkNickname(nickname));
  }

  @Get('email/:email')
  async checkEmail(@Param('email') email: string) {
    return ApiResponse.ok(await this.memberService.checkEmail(email));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() dto: CreateMemberDto) {
    const result = await this.memberService.signUp(dto);
    return ApiResponse.created(result, '회원가입에 성공했습니다.');
  }
}
