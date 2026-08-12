import ms from "ms";
import type { Response } from "express";

import { IS_PROD, JWT_EXPIRES_IN } from "../config/env.js";

export const AUTH_COOKIE_NAME = "token";

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: IS_PROD,
    maxAge: ms(JWT_EXPIRES_IN as ms.StringValue),
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "strict",
    secure: IS_PROD,
  });
}
