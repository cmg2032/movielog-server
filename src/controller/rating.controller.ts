import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RatingService } from '../service/rating.service.js';
import { CreateRatingDto } from '../dto/create-rating.dto.js';
import { UpdateRatingDto } from '../dto/update-rating.dto.js';
import { ApiResponse } from '../common/api-response.js';
import { AuthGuard } from '../guard/auth.guard.js';
import type { AuthenticatedRequest } from '../guard/auth.guard.js';

// 경로가 /members/... 와 /ratings/... 로 나뉘므로 괄호를 비우고 메서드마다 전체 경로를 적습니다
@Controller()
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  // 5주차에 만든 유저별 평점 조회입니다. 공개 API라 AuthGuard를 붙이지 않습니다.
  @Get('members/:memberId/ratings')
  async getMemberRatings(@Param('memberId', ParseIntPipe) memberId: number) {
    return ApiResponse.ok(
      await this.ratingService.getRatingsByMember(memberId),
    );
  }

  // 경로에서 members/:memberId가 사라지고 memberId는 Guard가 담아둔 값을 씁니다
  @Post('ratings')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateRatingDto,
  ) {
    const result = await this.ratingService.create(request.memberId, dto);
    return ApiResponse.created(result, '평점을 등록했습니다.');
  }

  @Patch('ratings/:ratingId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @Req() request: AuthenticatedRequest,
    @Param('ratingId', ParseIntPipe) ratingId: number,
    @Body() dto: UpdateRatingDto,
  ) {
    const result = await this.ratingService.update(
      request.memberId,
      ratingId,
      dto,
    );
    return ApiResponse.ok(result, '평점을 수정했습니다.');
  }

  // 응답 바디(isSuccess/code/message)가 항상 있으므로 204 대신 200을 씁니다
  @Delete('ratings/:ratingId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async delete(
    @Req() request: AuthenticatedRequest,
    @Param('ratingId', ParseIntPipe) ratingId: number,
  ) {
    await this.ratingService.delete(request.memberId, ratingId);
    return ApiResponse.ok(null, '평점을 삭제했습니다.');
  }
}
