import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import type { Request } from "express";
import express, { Express } from "express";

import routes from "./routes/index.js";
import logger from "./utils/logger.js";
import { CLIENT_URL } from "./config/env.js";
import { notFound, errorHandler } from "./middleware/errors.js";

export function createApp(): Express {
  const app = express();

  app.use(
    pinoHttp({
      logger,
      genReqId: (req: Request) =>
        (req.headers["x-request-id"] as string) ?? crypto.randomUUID(),
      autoLogging: {
        ignore: (req: Request) => req.path === "/api/health",
      },
    }),
  );

  app.use(helmet());
  app.use(cors({ origin: CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.get("/", (_req, res) => {
    res.json({ message: "API is running", docs: "/api/health" });
  });

  app.use("/api", routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
