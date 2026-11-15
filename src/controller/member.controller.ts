import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MemberService } from '../service/member.service.js';
import { CreateMemberDto } from '../dto/create-member.dto.js';
import { MemberUpdateRequestDto } from '../dto/member-update-request.dto.js';
import { ApiResponse } from '../common/api-response.js';
import { AuthGuard } from '../guard/auth.guard.js';
import type { AuthenticatedRequest } from '../guard/auth.guard.js';

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  // 고정 경로(/me)는 변수 경로보다 위에 둡니다
  @Get('me')
  @UseGuards(AuthGuard) // 이 줄이 없으면 토큰 없이도 호출됩니다
  async getMyInfo(@Req() request: AuthenticatedRequest) {
    // Guard가 request.memberId에 담아둔 값을 꺼냅니다
    const result = await this.memberService.getMyInfo(request.memberId);
    return ApiResponse.ok(result, '회원 정보를 조회했습니다.');
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  async updateMyInfo(
    @Req() request: AuthenticatedRequest,
    @Body() dto: MemberUpdateRequestDto,
  ) {
    const result = await this.memberService.updateMyInfo(
      request.memberId,
      dto,
    );
    return ApiResponse.ok(result, '회원 정보를 수정했습니다.');
  }

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
