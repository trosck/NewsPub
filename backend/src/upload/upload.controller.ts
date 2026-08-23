import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { TigrisService } from "./tigris.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { UserDocument } from "../modules/users/schemas/user.schema";

export interface UploadResult {
  url: string;
  name: string;
  size: number;
  type: string;
}

@Controller("api/upload")
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly tigrisService: TigrisService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: UserDocument,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException("File is required");
    }

    const key = `${user._id}/${Date.now()}-${file.originalname}`;
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
