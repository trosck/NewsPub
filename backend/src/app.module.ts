import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { LoggerModule } from "nestjs-pino";
import pino from "pino";
import type { IncomingMessage } from "node:http";

import configuration from "./config/configuration";
import { AppController } from "./app.controller";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { NewsModule } from "./news/news.module";
import { UploadModule } from "./upload/upload.module";
import { RealtimeModule } from "./realtime/realtime.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get<boolean>("isProd", false);
        const isTest = process.env.NODE_ENV === "test";

        const pinoOptions: pino.LoggerOptions = {
          level: process.env.LOG_LEVEL ?? (isProd ? "info" : "debug"),
          timestamp: pino.stdTimeFunctions.isoTime,
          formatters: {
            level: (label) => ({ level: label }),
          },
          ...(!isProd &&
            !isTest && {
            transport: {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "HH:MM:ss Z",
                ignore: "pid,hostname",
              },
            },
          }),
        };

        return {
          pinoHttp: {
            ...pinoOptions,
            genReqId: (req: IncomingMessage) => {
              const requestId = req.headers["x-request-id"];
              return typeof requestId === "string" && requestId.length > 0
                ? requestId
                : crypto.randomUUID();
            },
            autoLogging: {
              ignore: (req: IncomingMessage) =>
                req.url === "/api/health",
            },
          },
        };
      },
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>("mongodbUri"),
        strictQuery: true,
      }),
    }),
    UsersModule,
    AuthModule,
    NewsModule,
    UploadModule,
    RealtimeModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
