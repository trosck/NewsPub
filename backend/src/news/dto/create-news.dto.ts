import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

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

export class CreateNewsDto {
  @IsString({ message: "title and content are required" })
  @IsNotEmpty({ message: "title and content are required" })
  title: string;

  @IsString({ message: "title and content are required" })
  @IsNotEmpty({ message: "title and content are required" })
  content: string;

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
