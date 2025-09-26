import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? (exception as HttpException).getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse: any = isHttp
      ? (exception as HttpException).getResponse()
      : { message: 'Internal server error' };

    const message =
      typeof errorResponse === 'string'
        ? errorResponse
        : errorResponse.message || 'Error';

    const errorPayload = {
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV !== 'production') {
      (errorPayload as any).stack = (exception as any)?.stack;
      (errorPayload as any).method = request.method;
    }

    this.logger.error(`${request.method} ${request.url} -> ${status}: ${message}`);
    response.status(status).json(errorPayload);
  }
}
