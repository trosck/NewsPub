import { News } from "../models/News.js";
import logger from "../utils/logger.js";
import { NEWS_PUBLISH_INTERVAL_MS } from "../config/env.js";
import { NewsEventType } from "../types/realtime.js";
import { emitNewsEvent } from "./socket.js";

let timer: NodeJS.Timeout | null = null;

async function tick(): Promise<void> {
  try {
    const filter = {
      published: false,
      publish_at: { $lte: new Date() },
    };

    const pending = await News.find(filter, { _id: 1 }).lean();
    if (pending.length === 0) return;

    const ids = pending.map((n) => String(n._id));
    const result = await News.updateMany(
      { _id: { $in: pending.map((n) => n._id) } },
      { $set: { published: true } },
    );

    if (result.modifiedCount > 0) {
      logger.info(
        { count: result.modifiedCount },
        "News published by scheduler",
      );

      for (const id of ids) {
        emitNewsEvent(NewsEventType.Updated, { id });
      }
    }
  } catch (err) {
    logger.error({ err }, "News publisher tick failed");
  }
}

export function startNewsPublisher(): void {
  if (timer) return;

  void tick();
  timer = setInterval(() => {
    void tick();
  }, NEWS_PUBLISH_INTERVAL_MS);

  logger.info(
    { intervalMs: NEWS_PUBLISH_INTERVAL_MS },
    "News publisher started",
  );
}

export function stopNewsPublisher(): void {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
  logger.info("News publisher stopped");
}
