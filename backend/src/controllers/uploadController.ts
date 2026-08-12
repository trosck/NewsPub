import { Response, NextFunction } from "express";

import { ApiError, asyncHandler } from "../middleware/errors.js";
import type { AuthenticatedRequest } from "../types/request.js";
import { uploadObject } from "../services/tigris.js";

interface UploadResult {
  url: string;
  name: string;
  size: number;
  type: string;
}

export const createUpload = asyncHandler(
  async (
    req: AuthenticatedRequest & { file?: Express.Multer.File },
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "Not authorized");
    }

    const file = req.file;
    if (!file) {
      throw new ApiError(400, "File is required");
    }

    const key = `${req.user._id}/${Date.now()}-${file.originalname}`;
    const data = await uploadObject(key, file.buffer, file.mimetype);

    const result: UploadResult = {
      url: data.url,
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
    };

    res.status(201).json(result);
  },
);
