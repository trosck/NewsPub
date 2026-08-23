import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe, BadRequestException } from "@nestjs/common";
import type { Response } from "supertest";

export function setCookies(res: Response): string[] {
  return (res.headers["set-cookie"] as unknown as string[]) ?? [];
}

export function cookieHeader(res: Response): string {
  return setCookies(res)[0]?.split(";")[0] ?? "";
}
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import express from "express";

import { AppModule } from "../app.module";
import { AllExceptionsFilter } from "../common/filters/all-exceptions.filter";
import { Logger } from "nestjs-pino";

export async function createTestApp(): Promise<INestApplication> {
  const app = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const instance = app.createNestApplication({ bodyParser: false });

  instance.use(helmet());
  instance.use(
    cors({ origin: process.env.CLIENT_URL ?? "", credentials: true }),
  );
  instance.use(express.json({ limit: "1mb" }));
  instance.use(express.urlencoded({ extended: true }));
  instance.use(cookieParser());

  instance.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (errors) => {
        const first = errors[0];
        const constraints = first?.constraints;
        const message = constraints
          ? (Object.values(constraints)[0] ?? "Bad request")
          : "Bad request";
        return new BadRequestException(message);
      },
    }),
  );
  instance.useGlobalFilters(
    new AllExceptionsFilter(instance.get(Logger, { strict: false })),
  );

  await instance.init();

  return instance;
}
