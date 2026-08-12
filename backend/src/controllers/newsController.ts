import { Request, Response, NextFunction } from "express";
import mongoose, { Types } from "mongoose";

import { ApiError, asyncHandler } from "../middleware/errors.js";
import { News, type Attachment } from "../models/News.js";
import type { AuthenticatedRequest } from "../types/request.js";
import { NewsEventType } from "../types/realtime.js";
import { emitNewsEvent } from "../services/socket.js";

interface ListQuery {
  limit?: string;
  offset?: string;
  category?: string;
}

interface CreateBody {
  title?: string;
  content?: string;
  summary?: string;
  category?: string;
  published?: boolean;
  publish_at?: string | null;
  slug?: string;
  attachments?: Attachment[];
}

interface UpdateBody {
  title?: string;
  content?: string;
  summary?: string;
  category?: string;
  published?: boolean;
  publish_at?: string | null;
  slug?: string;
  attachments?: Attachment[];
}

function findNews(id: string) {
  const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
  return News.findOne(query);
}

function parsePublishAt(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, "publish_at must be a valid ISO 8601 date");
  }

  return date;
}

export const listNews = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { limit, offset, category } = req.query as ListQuery;

    const parsedLimit = Math.min(Number(limit) || 20, 100);
    const parsedOffset = Math.max(Number(offset) || 0, 0);

    const filter: Record<string, unknown> = { published: true };
    if (category) filter.category = category;

    const [total, items] = await Promise.all([
      News.countDocuments(filter),
      News.find(filter)
        .sort({ createdAt: -1 })
        .skip(parsedOffset)
        .limit(parsedLimit)
        .populate("author", "name"),
    ]);

    res.json({
      total,
      items: items.map((n) => n.toJSON()),
      limit: parsedLimit,
      offset: parsedOffset,
    });
  },
);

export const getNews = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };

    const news = await findNews(id).populate("author", "name");
    if (!news) return next(new ApiError(404, "News not found"));

    if (!news.published) {
      const isAuthor = req.user && news.author.equals(req.user._id);
      if (!isAuthor) return next(new ApiError(404, "News not found"));
    }

    res.json(news.toJSON());
  },
);

export const createNews = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { title, content, summary, category, published, slug, attachments } =
      req.body as CreateBody;

    if (!title || !content) {
      return next(new ApiError(400, "title and content are required"));
    }

    let publish_at: Date | null | undefined;
    try {
      publish_at = parsePublishAt((req.body as CreateBody).publish_at);
    } catch (err) {
      return next(err);
    }

    try {
      const news = await News.create({
        title,
        content,
        summary,
        category,
        published,
        publish_at,
        slug,
        attachments,
        author: req.user!._id,
      });

      emitNewsEvent(NewsEventType.Created, { id: String(news._id) });
      res.status(201).json({ news: news.toJSON() });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        return next(new ApiError(409, "Slug already in use"));
      }
      next(err);
    }
  },
);

export const updateNews = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };

    const news = await findNews(id);
    if (!news) return next(new ApiError(404, "News not found"));

    if (!news.author.equals(req.user!._id as Types.ObjectId)) {
      return next(new ApiError(403, "Only the author can modify this news"));
    }

    const { title, content, summary, category, published, slug, attachments } =
      req.body as UpdateBody;

    let publishAtParsed: Date | null | undefined;
    try {
      publishAtParsed = parsePublishAt((req.body as UpdateBody).publish_at);
    } catch (err) {
      return next(err);
    }

    if (title !== undefined) news.title = title;
    if (content !== undefined) news.content = content;
    if (summary !== undefined) news.summary = summary;
    if (category !== undefined) news.category = category;
    if (published !== undefined) news.published = published;
    if (slug !== undefined) news.slug = slug;
    if (publishAtParsed !== undefined) news.publish_at = publishAtParsed;
    if (attachments !== undefined) news.attachments = attachments;

    try {
      await news.save();
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        return next(new ApiError(409, "Slug already in use"));
      }
      throw err;
    }

    emitNewsEvent(NewsEventType.Updated, { id: String(news._id) });
    res.json({ news: news.toJSON() });
  },
);

export const deleteNews = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    const news = await findNews(id);

    if (!news) return next(new ApiError(404, "News not found"));

    if (!news.author.equals(req.user!._id)) {
      return next(new ApiError(403, "Only the author can delete this news"));
    }

    await news.deleteOne();
    emitNewsEvent(NewsEventType.Deleted, { id: String(news._id) });
    res.status(204).end();
  },
);
