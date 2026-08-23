import { Injectable, ConflictException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { Response } from "express";

import { UsersService } from "../users/users.service";
import type { UserDocument } from "../users/schemas/user.schema";
import { setAuthCookie, clearAuthCookie } from "../common/utils/auth-cookie";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private signToken(userId: string): string {
    return this.jwtService.sign({ sub: userId });
  }

  async register(
    data: { name: string; email: string; password: string },
    res: Response,
  ): Promise<{ user: unknown }> {
    try {
      const exists = await this.usersService.findByEmail(data.email);
      if (exists) throw new ConflictException("Email already in use");

      const user = await this.usersService.create(data);
      setAuthCookie(res, this.signToken(String(user._id)), {
        isProd: this.configService.get<boolean>("isProd", false),
        jwtExpiresIn: this.configService.get<string>("jwtExpiresIn", "7d"),
      });
      return { user: user.toJSON() };
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        throw new ConflictException("Email already in use");
      }
      throw err;
    }
  }

  async login(
    data: { email: string; password: string },
    res: Response,
  ): Promise<{ user: unknown }> {
    const user = await this.usersService.findByEmail(data.email);
    if (!user || !(await user.comparePassword(data.password))) {
      throw new UnauthorizedException("Invalid credentials");
    }

    setAuthCookie(res, this.signToken(String(user._id)), {
      isProd: this.configService.get<boolean>("isProd", false),
      jwtExpiresIn: this.configService.get<string>("jwtExpiresIn", "7d"),
    });
    return { user: user.toJSON() };
  }

  logout(res: Response): { success: boolean } {
    clearAuthCookie(res, {
      isProd: this.configService.get<boolean>("isProd", false),
    });
    return { success: true };
  }
}
