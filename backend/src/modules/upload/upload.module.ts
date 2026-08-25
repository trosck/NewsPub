import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MulterModule } from "@nestjs/platform-express";
import multer from "multer";

import { UploadController } from "./upload.controller";
import { TigrisService } from "./tigris.service";

@Module({
  imports: [
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        storage: multer.memoryStorage(),
        limits: {
          fileSize:
            config.get<number>("s3.uploadLimitMb", 10) * 1024 * 1024,
        },
      }),
    }),
  ],
  controllers: [UploadController],
  providers: [TigrisService],
})
export class UploadModule {}
