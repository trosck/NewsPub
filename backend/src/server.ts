import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { NODE_ENV, PORT } from "./config/env.js";
import logger from "./utils/logger.js";
import {
  startNewsPublisher,
  stopNewsPublisher,
} from "./services/newsPublisher.js";
import { initSocket, closeSocket } from "./services/socket.js";

async function start(): Promise<void> {
  try {
    await connectDB();

    const app = createApp();

    const server = app.listen(PORT, () => {
      logger.info({ env: NODE_ENV, port: PORT }, "Server running");
    });

    initSocket(server);
    startNewsPublisher();

    const shutdown = async (signal: string): Promise<void> => {
      logger.info({ signal }, "Shutting down");
      stopNewsPublisher();
      await closeSocket();
      server.close(() => process.exit(0));
    };

    process.on("SIGINT", () => void shutdown("SIGINT"));
    process.on("SIGTERM", () => void shutdown("SIGTERM"));
  } catch (err) {
    logger.error({ err }, "Failed to start server");
    process.exit(1);
  }
}

start();
