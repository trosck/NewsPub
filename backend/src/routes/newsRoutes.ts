import { Router } from "express";

import { authMiddleware } from "../middleware/auth.js";
import {
  createNews,
  deleteNews,
  getNews,
  listNews,
  updateNews,
} from "../controllers/newsController.js";

const router = Router();

router.get("/", listNews);
router.get("/:id", getNews);

router.use(authMiddleware);
router.post("/", createNews);
router.patch("/:id", updateNews);
router.delete("/:id", deleteNews);

export default router;
