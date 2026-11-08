import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { Member } from './entity/member.entity.js';
import { Rating } from './entity/rating.entity.js';
import { MemberController } from './controller/member.controller.js';
import { RatingController } from './controller/rating.controller.js';
import { MemberService } from './service/member.service.js';
import { RatingService } from './service/rating.service.js';

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
  ],
  controllers: [AppController, MemberController, RatingController],
  providers: [AppService, MemberService, RatingService],
})
export class AppModule {}
