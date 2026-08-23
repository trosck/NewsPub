import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";

import { NewsService } from "./news.service";
import { CreateNewsDto } from "./dto/create-news.dto";
import { UpdateNewsDto } from "./dto/update-news.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { UserDocument } from "../users/schemas/user.schema";

@Controller("api/news")
@UseGuards(JwtAuthGuard)
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  list(
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
    @Query("category") category?: string,
  ) {
    return this.newsService.list({ limit, offset, category });
  }

  @Get(":id")
  get(@Param("id") id: string, @CurrentUser() user: UserDocument | undefined) {
    return this.newsService.get(id, user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateNewsDto, @CurrentUser() user: UserDocument) {
    return this.newsService.create(dto, user);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateNewsDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.newsService.update(id, dto, user);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param("id") id: string,
    @CurrentUser() user: UserDocument,
  ): Promise<void> {
    await this.newsService.delete(id, user);
  }
}
