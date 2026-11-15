import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from '../entity/rating.entity.js';
import { Member } from '../entity/member.entity.js';
import { RatingResponseDto } from '../dto/rating-response.dto.js';
import { CreateRatingDto } from '../dto/create-rating.dto.js';
import { UpdateRatingDto } from '../dto/update-rating.dto.js';
import { ApiException } from '../exception/api.exception.js';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  // 5주차에 만든 조회입니다. 예외만 ApiException으로 바꿨습니다.
  async getRatingsByMember(memberId: number): Promise<RatingResponseDto[]> {
    await this.findMemberOrThrow(memberId);

    const ratings = await this.ratingRepository.find({
      where: { member: { memberId } },
      order: { ratingId: 'DESC' },
    });
    return ratings.map((rating) => RatingResponseDto.from(rating));
  }

  async create(
    memberId: number,
    dto: CreateRatingDto,
  ): Promise<RatingResponseDto> {
    const member = await this.findMemberOrThrow(memberId);

    // (member_id, movie_id) 복합 UNIQUE 제약이 있지만, 우리가 정한 응답을 주려고 먼저 확인합니다.
    const existing = await this.ratingRepository.findOne({
      where: { member: { memberId }, movieId: dto.movieId },
    });
    if (existing) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'RATING409_1',
        '이미 이 영화에 평점을 남기셨습니다.',
      );
    }

    const saved = await this.ratingRepository.save(
      this.ratingRepository.create({
        member,
        movieId: dto.movieId,
        score: dto.score,
        comment: dto.comment ?? null,
      }),
    );
    return RatingResponseDto.from(saved);
  }

  async update(
    memberId: number,
    ratingId: number,
    dto: UpdateRatingDto,
  ): Promise<RatingResponseDto> {
    const rating = await this.findOwnedRating(memberId, ratingId);

    rating.score = dto.score;
    rating.comment = dto.comment ?? null;

    const saved = await this.ratingRepository.save(rating);
    return RatingResponseDto.from(saved);
  }

  async delete(memberId: number, ratingId: number): Promise<void> {
    const rating = await this.findOwnedRating(memberId, ratingId);
    await this.ratingRepository.remove(rating);
  }

  private async findMemberOrThrow(memberId: number): Promise<Member> {
    const member = await this.memberRepository.findOneBy({ memberId });
    if (!member) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'MEMBER404_1',
        '해당 회원을 찾을 수 없습니다.',
      );
    }
    return member;
  }

  /**
   * 평점을 찾고 그 평점이 요청자의 것인지까지 확인합니다.
   * 수정과 삭제가 똑같은 검사를 하므로 메서드로 묶었습니다.
   */
  private async findOwnedRating(
    memberId: number,
    ratingId: number,
  ): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({
      where: { ratingId },
      relations: { member: true }, // 작성자를 함께 불러와야 소유권을 비교할 수 있습니다
    });

    if (!rating) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'RATING404_1',
        '해당 평점을 찾을 수 없습니다.',
      );
    }

    // 존재는 하지만 내 것이 아니라면 인가 실패입니다.
    // Number()로 감싸 두면 bigNumberStrings 설정이 빠져도 "1" !== 1 문제로 403이 나지 않습니다.
    if (Number(rating.member.memberId) !== memberId) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'RATING403_1',
        '본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.',
      );
    }

    return rating;
  }
}
