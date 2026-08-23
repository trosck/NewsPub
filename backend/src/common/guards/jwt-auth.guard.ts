import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";

import { UsersService } from "../../modules/users/users.service";
import type { UserDocument } from "../../modules/users/schemas/user.schema";

export const AUTH_COOKIE_NAME = "token";

export interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}

function extractToken(req: Request): string | null {
  const cookie = (req.cookies as Record<string, unknown> | undefined)?.[
    AUTH_COOKIE_NAME
  ];
  if (typeof cookie === "string" && cookie.length > 0) {
    return cookie;
  }

  const header = req.headers.authorization;
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    return header.slice(7);
  }

  return null;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    try {
      const token = extractToken(request);
      if (!token) throw new UnauthorizedException("Not authorized");

      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
      const sub = payload?.sub;
      if (typeof sub !== "string") {
        throw new UnauthorizedException("Not authorized");
      }

      const user = await this.usersService.findById(sub);
      if (!user) throw new UnauthorizedException("Not authorized");

      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException("Not authorized");
    }
  }
}
