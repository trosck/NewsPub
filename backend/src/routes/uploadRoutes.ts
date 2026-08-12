import { Router } from "express";
import multer from "multer";

import { S3_UPLOAD_LIMIT_MB } from "../config/env.js";
import { createUpload } from "../controllers/uploadController.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: S3_UPLOAD_LIMIT_MB * 1024 * 1024 },
});

router.post("/", upload.single("file"), createUpload);

export default router;
