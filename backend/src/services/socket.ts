import { Server } from "socket.io";
import { parseCookie } from "cookie";
import type http from "node:http";
import type { IncomingHttpHeaders } from "node:http";

import { User } from "../models/User.js";
import logger from "../utils/logger.js";
import { verifyToken } from "../utils/jwt.js";
import { CLIENT_URL } from "../config/env.js";
import { AUTH_COOKIE_NAME } from "../utils/cookie.js";
import { NewsEventType, type NewsEvent } from "../types/realtime.js";

let io: Server | null = null;

async function authenticate(
  headers: IncomingHttpHeaders,
): Promise<string | null> {
  const raw = headers.cookie;
  if (typeof raw !== "string" || raw.length === 0) return null;

  const cookies = parseCookie(raw);
  const token = cookies[AUTH_COOKIE_NAME];
  if (typeof token !== "string" || token.length === 0) return null;

  try {
    const payload = verifyToken(token);
    const sub = payload.sub;
    if (typeof sub !== "string") return null;

    const user = await User.findById(sub);
    return user ? sub : null;
  } catch {
    return null;
  }
}

export function initSocket(server: http.Server): void {
  if (io) return;

  io = new Server(server, {
    cors: { origin: CLIENT_URL, credentials: true },
  });

  io.use(async (socket, next) => {
    try {
      const userId = await authenticate(socket.handshake.headers);
      if (!userId) {
        next(new Error("unauthorized"));
        return;
      }

      socket.data.userId = userId;
      next();
    } catch (err) {
      next(err instanceof Error ? err : new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    logger.info(
      { id: socket.id, userId: socket.data.userId },
      "WS client connected",
    );

    socket.on("disconnect", (reason) => {
      logger.info({ id: socket.id, reason }, "WS client disconnected");
    });
  });

  logger.info("Realtime (socket.io) initialized");
}

export function closeSocket(): Promise<void> {
  if (!io) return Promise.resolve();

  const instance = io;
  io = null;
  return new Promise((resolve) => {
    instance.close(() => resolve());
  });
}

export function emitNewsEvent(type: NewsEventType, data: { id: string }): void {
  if (!io) return;

  const event: NewsEvent = { type, data };
  io.emit("notification", event);
}
