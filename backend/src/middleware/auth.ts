import { Response, NextFunction } from "express";

import { User } from "../models/User.js";
import type { AuthenticatedRequest } from "../types/request.js";
import { verifyToken } from "../utils/jwt.js";
import { AUTH_COOKIE_NAME } from "../utils/cookie.js";

import { ApiError } from "./errors.js";

function extractToken(req: AuthenticatedRequest): string | null {
  const cookie = req.cookies?.[AUTH_COOKIE_NAME];
  if (typeof cookie === "string" && cookie.length > 0) {
    return cookie;
  }

  const header = req.headers.authorization;
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    return header.slice(7);
  }

  return null;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractToken(req);
    if (!token) throw new ApiError(401, "Not authorized");

    const payload = verifyToken(token);

    const user = await User.findById(payload.sub);
    if (!user) throw new ApiError(401, "User no longer exists");

    req.user = user;

    next();
  } catch {
    next(new ApiError(401, "Not authorized"));
  }
};
