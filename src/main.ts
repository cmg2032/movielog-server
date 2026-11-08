import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './filter/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('v5');

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  // 요청 로그
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () =>
      console.log(
        `[요청] ${req.method} ${decodeURIComponent(req.originalUrl)} → ${res.statusCode}`,
      ),
    );
    next();
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
