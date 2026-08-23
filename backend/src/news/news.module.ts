import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { News, NewsSchema } from "./schemas/news.schema";
import { NewsController } from "./news.controller";
import { NewsService } from "./news.service";
import { NewsPublisherService } from "./news-publisher.service";
import { RealtimeModule } from "../realtime/realtime.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: News.name, schema: NewsSchema }]),
    RealtimeModule,
  ],
  controllers: [NewsController],
  providers: [NewsService, NewsPublisherService],
})
export class NewsModule {}
