import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { BadRequestException, Logger, ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import express from "express";
import { Logger as PinoLogger } from "nestjs-pino";

import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  app.useLogger(app.get(Logger));

  app.use(helmet());
  const clientUrl = process.env.CLIENT_URL ?? "";
  app.use(cors({ origin: clientUrl, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.useGlobalPipes(
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
  app.useGlobalFilters(
    new AllExceptionsFilter(app.get(PinoLogger, { strict: false })),
  );

  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? "5000");
  await app.listen(port);

  new Logger("Bootstrap").log(`Server running on port ${port}`);
}

void bootstrap();
