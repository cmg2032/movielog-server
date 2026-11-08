export class ApiResponse<T> {
  constructor(
    public readonly isSuccess: boolean,
    public readonly code: string,
    public readonly message: string,
    public readonly result: T | null,
  ) {}

  static ok<T>(result: T, message = '요청에 성공했습니다.'): ApiResponse<T> {
    return new ApiResponse(true, 'COMMON200', message, result);
  }

  static created<T>(
    result: T,
    message = '생성에 성공했습니다.',
  ): ApiResponse<T> {
    return new ApiResponse(true, 'COMMON201', message, result);
  }

  static fail(
    code: string,
    message: string,
    result: unknown = null,
  ): ApiResponse<unknown> {
    return new ApiResponse(false, code, message, result);
  }
}
