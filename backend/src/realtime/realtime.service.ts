import { Injectable, Logger, OnApplicationShutdown } from "@nestjs/common";
import { Server } from "socket.io";

import { NewsEventType, type NewsEvent } from "./realtime.types";

@Injectable()
export class RealtimeService implements OnApplicationShutdown {
  private readonly logger = new Logger(RealtimeService.name);
  private io: Server | null = null;

  setServer(io: Server): void {
    this.io = io;
    this.logger.log("Realtime (socket.io) initialized");
  }

  emitNewsEvent(type: NewsEventType, data: { id: string }): void {
    if (!this.io) return;

    const event: NewsEvent = { type, data };
    this.io.emit("notification", event);
  }

  async onApplicationShutdown(): Promise<void> {
    if (!this.io) return;

    const instance = this.io;
    this.io = null;
    await new Promise<void>((resolve) => instance.close(() => resolve()));
  }
}
