import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ConsoleLogger, Logger, ValidationPipe } from "@nestjs/common";

import cors from "cors";
import helmet from "helmet";
import express from "express";
import cookieParser from "cookie-parser";

import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  const logger = app.get(ConsoleLogger);
  app.useLogger(logger);

  app.use(helmet());
  const clientUrl = process.env.CLIENT_URL ?? "";
  app.use(cors({ origin: clientUrl, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter(logger));

  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? "5000");
  await app.listen(port);

  new Logger("Bootstrap").log(`Server running on port ${port}`);
}

void bootstrap();
