import { io, type Socket } from "socket.io-client";
import { API_URL } from "../config.ts";

export const NOTIFICATION_EVENT = "notification";

export function createSocket(): Socket {
  return io(API_URL, {
    withCredentials: true,
    autoConnect: false,
  });
}
