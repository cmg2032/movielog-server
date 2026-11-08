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
} from '@nestjs/common';
import { RatingService } from '../service/rating.service.js';
import { CreateRatingDto } from '../dto/create-rating.dto.js';
import { UpdateRatingDto } from '../dto/update-rating.dto.js';
import { ApiResponse } from '../common/api-response.js';

@Controller('members/:memberId/ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Get()
  async getMemberRatings(@Param('memberId', ParseIntPipe) memberId: number) {
    return ApiResponse.ok(
      await this.ratingService.getRatingsByMember(memberId),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: CreateRatingDto,
  ) {
    const ratingId = await this.ratingService.create(memberId, dto);
    return ApiResponse.created({ ratingId }, '평점이 등록되었습니다.');
  }

  @Patch(':ratingId')
  async update(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ratingId', ParseIntPipe) ratingId: number,
    @Body() dto: UpdateRatingDto,
  ) {
    await this.ratingService.update(ratingId, memberId, dto);
    return ApiResponse.ok({ ratingId }, '평점이 수정되었습니다.');
  }

  @Delete(':ratingId')
  async delete(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Param('ratingId', ParseIntPipe) ratingId: number,
  ) {
    await this.ratingService.delete(ratingId, memberId);
    return ApiResponse.ok({ ratingId }, '평점이 삭제되었습니다.');
  }
}
