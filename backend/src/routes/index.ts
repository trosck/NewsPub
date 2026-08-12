import { Router } from "express";
import authRoutes from "./authRoutes.js";
import { authMiddleware } from "../middleware/auth.js";
import newsRoutes from "./newsRoutes.js";
import uploadRoutes from "./uploadRoutes.js";
import { me } from "../controllers/authController.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.use("/auth", authRoutes);

router.use(authMiddleware);

router.use("/upload", uploadRoutes);
router.use("/news", newsRoutes);
router.get("/me", me);

export default router;
