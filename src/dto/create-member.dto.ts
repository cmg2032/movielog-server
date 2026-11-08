import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateMemberDto {
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  @MaxLength(254, { message: '이메일은 254자 이하여야 합니다.' })
  email: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/, {
    message:
      '비밀번호는 대문자/소문자/숫자/특수문자를 포함한 8자 이상이어야 합니다.',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '닉네임을 입력해주세요.' })
  @Length(2, 12, { message: '닉네임은 2자 이상 12자 이하여야 합니다.' })
  nickname: string;
}
