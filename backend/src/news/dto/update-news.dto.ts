import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

import { CreateNewsDto } from "./create-news.dto";

class AttachmentDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  size: number;

  @IsString()
  type: string;

  @IsString()
  url: string;
}

export class UpdateNewsDto implements Partial<CreateNewsDto> {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  publish_at?: string | null;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}
