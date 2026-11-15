import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { Member } from './entity/member.entity.js';
import { Rating } from './entity/rating.entity.js';
import { MemberController } from './controller/member.controller.js';
import { RatingController } from './controller/rating.controller.js';
import { MemberService } from './service/member.service.js';
import { RatingService } from './service/rating.service.js';
import { AuthController } from './controller/auth.controller.js';
import { AuthService } from './service/auth.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.getOrThrow('DB_HOST'),
        port: 3306,
        username: configService.getOrThrow('DB_USER'),
        password: configService.getOrThrow('DB_PASSWORD'),
        database: configService.getOrThrow('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
        bigNumberStrings: false, // BIGINT를 문자열이 아닌 숫자로 반환
      }),
    }),
    TypeOrmModule.forFeature([Member, Rating]),
    JwtModule.registerAsync({
      global: true, // 전역 등록: 어느 서비스에서든 JwtService 주입 가능
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          // 환경변수는 문자열이므로 초 단위 숫자로 변환
          expiresIn: Number(configService.get<string>('JWT_ACCESS_EXPIRATION') ?? 3600),
        },
      }),
    }),
  ],
  controllers: [AppController, MemberController, RatingController, AuthController],
  providers: [AppService, MemberService, RatingService, AuthService],
})
export class AppModule {}
