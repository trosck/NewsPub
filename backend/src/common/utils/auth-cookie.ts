import ms from "ms";
import type { Response } from "express";

import type { AppConfig } from "../../config/configuration";

export const AUTH_COOKIE_NAME = "token";

export function setAuthCookie(
  res: Response,
  token: string,
  config: Pick<AppConfig, "isProd" | "jwtExpiresIn">,
): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: config.isProd,
    maxAge: ms(config.jwtExpiresIn as ms.StringValue),
  });
}

export function clearAuthCookie(
  res: Response,
  config: Pick<AppConfig, "isProd">,
): void {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "strict",
    secure: config.isProd,
  });
}
