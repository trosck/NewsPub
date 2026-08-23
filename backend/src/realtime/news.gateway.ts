import { Logger } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { JwtService } from "@nestjs/jwt";
import { Server, Socket } from "socket.io";

// `cookie` v2 ships pure-ESM builds that can't be required from CommonJS,
// so parse the (simple key=value) cookie header directly.
function readCookie(raw: string, name: string): string | null {
  for (const part of raw.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) {
      return part.slice(eq + 1).trim();
    }
  }
  return null;
}

import { RealtimeService } from "./realtime.service";
import { UsersService } from "../modules/users/users.service";
import { AUTH_COOKIE_NAME } from "../common/guards/jwt-auth.guard";

const logger = new Logger("NewsGateway");

@WebSocketGateway({
  cors: { origin: process.env.CLIENT_URL, credentials: true },
})
export class NewsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly realtimeService: RealtimeService,
    private readonly usersService: UsersService,
  ) {}

  afterInit(server: Server): void {
    server.use((socket, next) => {
      void this.authenticate(socket)
        .then((userId) => {
          if (!userId) return next(new Error("unauthorized"));
          socket.data.userId = userId;
          next();
        })
        .catch(() => next(new Error("unauthorized")));
    });

    this.realtimeService.setServer(server);
  }

  private async authenticate(socket: Socket): Promise<string | null> {
    const raw = socket.handshake.headers.cookie;
    if (typeof raw !== "string" || raw.length === 0) return null;

    const token = readCookie(raw, AUTH_COOKIE_NAME);
    if (typeof token !== "string" || token.length === 0) return null;

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
      const sub = payload?.sub;
      if (typeof sub !== "string") return null;

      const user = await this.usersService.findById(sub);
      return user ? String(user._id) : null;
    } catch {
      return null;
    }
  }

  handleConnection(client: Socket): void {
    logger.log(
      `WS client connected id=${client.id} userId=${client.data.userId}`,
    );
  }

  handleDisconnect(client: Socket): void {
    logger.log(`WS client disconnected id=${client.id}`);
  }
}
