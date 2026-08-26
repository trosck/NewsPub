import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { News, NewsDocument } from "./schemas/news.schema";

@Injectable()
export class NewsPublisherService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(NewsPublisherService.name);
  private timer: NodeJS.Timeout | null = null;
  private readonly intervalMs: number;

  constructor(
    @InjectModel(News.name) private readonly newsModel: Model<NewsDocument>,
    configService: ConfigService,
  ) {
    this.intervalMs = configService.get<number>("newsPublishIntervalMs", 60000);
  }

  onApplicationBootstrap(): void {
    if (this.timer) return;

    void this.tick();
    this.timer = setInterval(() => void this.tick(), this.intervalMs);

    this.logger.log(`News publisher started intervalMs=${this.intervalMs}`);
  }

  onApplicationShutdown(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
    this.logger.log("News publisher stopped");
  }

  private async tick(): Promise<void> {
    try {
      const filter = {
        published: false,
        publish_at: { $lte: new Date() },
      };

      const pending = await this.newsModel.find(filter, { _id: 1 }).lean();
      if (pending.length === 0) return;

      const ids = pending.map((n) => String(n._id));
      const result = await this.newsModel.updateMany(
        { _id: { $in: pending.map((n) => n._id) } },
        { $set: { published: true } },
      );

      if (result.modifiedCount > 0) {
        this.logger.log(
          `News published by scheduler count=${result.modifiedCount}`,
        );
      }
    } catch (err) {
      this.logger.error("News publisher tick failed", err as Error);
    }
  }
}
