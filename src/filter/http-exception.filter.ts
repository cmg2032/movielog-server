import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiResponse } from '../common/api-response.js';

// @Catch()에 아무것도 넣지 않으면 HttpException뿐 아니라 예상 못 한 에러(500)까지 잡습니다.
// 그래야 "실패 응답은 항상 같은 구조"가 지켜집니다.
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    if (!(exception instanceof HttpException)) {
      this.logger.error(exception);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(ApiResponse.fail('COMMON500', '서버 내부 오류가 발생했습니다.'));
      return;
    }

    const status = exception.getStatus();
    const body = exception.getResponse();

    // ValidationPipe 에러는 message가 배열로 옵니다. → 첫 메시지는 message에, 전체는 result에.
    let message = exception.message;
    let result: unknown = null;
    if (typeof body === 'object' && body !== null && 'message' in body) {
      const raw = (body as { message: string | string[] }).message;
      if (Array.isArray(raw)) {
        message = raw[0] ?? message;
        result = raw;
      } else {
        message = raw;
      }
    }

    res
      .status(status)
      .json(ApiResponse.fail(`COMMON${status}`, message, result));
  }
}
