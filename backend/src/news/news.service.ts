import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, Types } from "mongoose";

import { News, NewsDocument } from "./schemas/news.schema";
import { CreateNewsDto } from "./dto/create-news.dto";
import { RealtimeService } from "../realtime/realtime.service";
import { NewsEventType } from "../realtime/realtime.types";
import type { UserDocument } from "../users/schemas/user.schema";

export interface ListResult {
  total: number;
  items: unknown[];
  limit: number;
  offset: number;
}

function findNews(model: Model<NewsDocument>, id: string) {
  const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
  return model.findOne(query);
}

function parsePublishAt(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException("publish_at must be a valid ISO 8601 date");
  }

  return date;
}

@Injectable()
export class NewsService {
  constructor(
    @InjectModel(News.name) private readonly newsModel: Model<NewsDocument>,
    private readonly realtime: RealtimeService,
  ) {}

  async list(query: {
    limit?: string;
    offset?: string;
    category?: string;
  }): Promise<ListResult> {
    const parsedLimit = Math.min(Number(query.limit) || 20, 100);
    const parsedOffset = Math.max(Number(query.offset) || 0, 0);

    const filter: Record<string, unknown> = { published: true };
    if (query.category) filter.category = query.category;

    const [total, items] = await Promise.all([
      this.newsModel.countDocuments(filter).exec(),
      this.newsModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(parsedOffset)
        .limit(parsedLimit)
        .populate("author", "name"),
    ]);

    return {
      total,
      items: items.map((n) => n.toJSON()),
      limit: parsedLimit,
      offset: parsedOffset,
    };
  }

  async get(id: string, requester: UserDocument | undefined): Promise<unknown> {
    const news = await findNews(this.newsModel, id).populate("author", "name");
    if (!news) throw new NotFoundException("News not found");

    if (!news.published) {
      const isAuthor = requester && news.author.equals(requester._id);
      if (!isAuthor) throw new NotFoundException("News not found");
    }

    return news.toJSON();
  }

  async create(
    dto: CreateNewsDto,
    author: UserDocument,
  ): Promise<{ news: unknown }> {
    const publishAt = parsePublishAt(dto.publish_at);

    let news: NewsDocument;
    try {
      news = await this.newsModel.create({
        title: dto.title,
        content: dto.content,
        summary: dto.summary,
        category: dto.category,
        published: dto.published,
        publish_at: publishAt,
        slug: dto.slug,
        attachments: dto.attachments,
        author: author._id,
      });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        throw new ConflictException("Slug already in use");
      }
      throw err;
    }

    this.realtime.emitNewsEvent(NewsEventType.Created, {
      id: String(news._id),
    });

    return { news: news.toJSON() };
  }

  async update(
    id: string,
    dto: CreateNewsDto,
    requester: UserDocument,
  ): Promise<{ news: unknown }> {
    const news = await findNews(this.newsModel, id);
    if (!news) throw new NotFoundException("News not found");

    if (!news.author.equals(requester._id as Types.ObjectId)) {
      throw new ForbiddenException("Only the author can modify this news");
    }

    const publishAt = parsePublishAt(dto.publish_at);

    if (dto.title !== undefined) news.title = dto.title;
    if (dto.content !== undefined) news.content = dto.content;
    if (dto.summary !== undefined) news.summary = dto.summary;
    if (dto.category !== undefined) news.category = dto.category;
    if (dto.published !== undefined) news.published = dto.published;
    if (dto.slug !== undefined) news.slug = dto.slug;
    if (publishAt !== undefined) news.publish_at = publishAt;
    if (dto.attachments !== undefined) news.attachments = dto.attachments;

    try {
      await news.save();
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        throw new ConflictException("Slug already in use");
      }
      throw err;
    }

    this.realtime.emitNewsEvent(NewsEventType.Updated, {
      id: String(news._id),
    });

    return { news: news.toJSON() };
  }

  async delete(id: string, requester: UserDocument): Promise<void> {
    const news = await findNews(this.newsModel, id);
    if (!news) throw new NotFoundException("News not found");

    if (!news.author.equals(requester._id)) {
      throw new ForbiddenException("Only the author can delete this news");
    }

    await news.deleteOne();

    this.realtime.emitNewsEvent(NewsEventType.Deleted, {
      id: String(news._id),
    });
  }
}
