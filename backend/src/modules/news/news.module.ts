import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { News, NewsSchema } from "./schemas/news.schema";
import { NewsController } from "./news.controller";
import { NewsService } from "./news.service";
import { NewsPublisherService } from "./news-publisher.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: News.name, schema: NewsSchema }]),
  ],
  controllers: [NewsController],
  providers: [NewsService, NewsPublisherService],
})
export class NewsModule {}
