import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { TigrisService } from "./tigris.service";
import type { UserDocument } from "../../modules/users/schemas/user.schema";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

export interface UploadResult {
  url: string;
  name: string;
  size: number;
  type: string;
}

@Controller("upload")
export class UploadController {
  constructor(private readonly tigrisService: TigrisService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException("File is required");
    }

    const key = `${Date.now()}-${file.originalname}`;
    const data = await this.tigrisService.uploadObject(
      key,
      file.buffer,
      file.mimetype,
    );

    return {
      url: data.url,
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
    };
  }
}
