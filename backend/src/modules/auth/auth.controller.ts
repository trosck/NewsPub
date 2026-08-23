import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";

import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { UserDocument } from "../users/schemas/user.schema";

@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: unknown }> {
    return this.authService.register(dto, res);
  }

  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: unknown }> {
    return this.authService.login(dto, res);
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response): { success: boolean } {
    return this.authService.logout(res);
  }
}

@Controller("api")
@UseGuards(JwtAuthGuard)
export class MeController {
  @Get("me")
  me(@CurrentUser() user: UserDocument | undefined): { user: unknown } {
    return { user: user?.toJSON() };
  }
}
