import { Request, Response, NextFunction } from "express";

import { ApiError, asyncHandler } from "../middleware/errors.js";
import { User } from "../models/User.js";
import type { AuthenticatedRequest } from "../types/request.js";
import { signToken } from "../utils/jwt.js";
import { setAuthCookie, clearAuthCookie } from "../utils/cookie.js";

interface RegisterBody {
  name?: string;
  email?: string;
  password?: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body as RegisterBody;

    if (!name || !email || !password) {
      return next(new ApiError(400, "name, email and password are required"));
    }

    try {
      const exists = await User.findOne({ email });
      if (exists) return next(new ApiError(409, "Email already in use"));

      const user = await User.create({ name, email, password });
      const token = signToken(user.id);
      setAuthCookie(res, token);
      res.status(201).json({ user: user.toJSON() });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        return next(new ApiError(409, "Email already in use"));
      }

      next(err);
    }
  },
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as LoginBody;
    if (!email || !password) {
      return next(new ApiError(400, "Email and password required"));
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return next(new ApiError(401, "Invalid credentials"));
    }

    const token = signToken(user.id);
    setAuthCookie(res, token);
    res.json({ user: user.toJSON() });
  },
);

export const logout = (_req: Request, res: Response): void => {
  clearAuthCookie(res);
  res.json({ success: true });
};

export const me = (req: AuthenticatedRequest, res: Response): void => {
  res.json({ user: req.user?.toJSON() });
};
