import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { LoggerModule } from "nestjs-pino";
import pino from "pino";

import configuration from "./config/configuration";
import { AppController } from "./app.controller";
import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from "./modules/auth/auth.module";
import { NewsModule } from "./modules/news/news.module";
import { UploadModule } from "./upload/upload.module";
import { RealtimeModule } from "./realtime/realtime.module";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get<boolean>("isProd");

        const pinoOptions: pino.LoggerOptions = {
          level: isProd ? "info" : "debug",
        };

        return {
          pinoHttp: pinoOptions,
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
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
