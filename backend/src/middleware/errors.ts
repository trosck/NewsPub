import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
  ErrorRequestHandler,
} from "express";

import logger from "../utils/logger.js";

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const notFound: RequestHandler = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res) => {
  const statusCode = err.statusCode ?? 500;
  const message = err.isOperational ? err.message : "Internal Server Error";

  if (statusCode >= 500) {
    logger.error({ err, status: statusCode }, "Unhandled error");
  }

  res.status(statusCode).json({ error: message });
};

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (_req: Request, _res: Response, _next: NextFunction) => {
    Promise.resolve(fn(_req, _res, _next)).catch(_next);
  };
}
