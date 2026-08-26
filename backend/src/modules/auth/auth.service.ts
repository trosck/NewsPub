import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import type { Response } from "express";

import type { User, UserDocument } from "../users/schemas/user.schema";
import { UsersService } from "../users/users.service";

const MINUTE_15 = 15 * 60 * 1000;
const DAY_7 = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(data: User, res: Response): Promise<UserDocument> {
    const exists = await this.usersService.findByEmail(data.email);
    if (exists) throw new ConflictException("Email already in use");

    const user = await this.usersService.create(data);

    await this.login(user, res);

    return user;
  }

  async refresh(token: string, res: Response) {
    let payload;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get("jwtSecret"),
      });
    } catch (err) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const newAccessToken = this.jwtService.sign(
      { sub: payload.sub },
      { expiresIn: "15m" },
    );

    const newRefreshToken = this.jwtService.sign(
      { sub: payload.sub },
      { expiresIn: this.configService.get("jwtExpiresIn") },
    );

    const isProd = this.configService.get<boolean>("isProd", false);

    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: MINUTE_15,
    });

    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: DAY_7,
    });

    return;
  }

  async login(user: UserDocument, res: Response) {
    const payload = { sub: user._id };

    const accessToken = this.jwtService.sign(payload, { expiresIn: "15m" });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get("jwtExpiresIn"),
    });

    const isProd = this.configService.get<boolean>("isProd", false);

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: MINUTE_15,
      path: "/",
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: DAY_7,
    });

    return;
  }

  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return user;
  }

  logout(res: Response) {
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/auth/refresh" });
  }
}
