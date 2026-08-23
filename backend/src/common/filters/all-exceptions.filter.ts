import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";
import type { Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const body =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: "Internal Server Error" };

    const message =
      typeof body === "string"
        ? body
        : typeof (body as { message?: unknown }).message === "string"
          ? ((body as { message: string }).message)
          : "Internal Server Error";

    if (statusCode >= 500) {
      this.logger.error({ err: exception, status: statusCode }, "Unhandled error");
    }

    response.status(statusCode).json({ error: message });
  }
}
