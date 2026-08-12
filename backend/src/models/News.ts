import { Schema, model, Document, Model, Types } from "mongoose";

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface NewsDocument extends Document {
  title: string;
  content: string;
  summary?: string;
  category?: string;
  author: Types.ObjectId;
  published: boolean;
  publish_at: Date | null;
  slug: string;
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

const SLUG_REGEX = /[^a-z0-9]+/g;

function slugify(value: string): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  const base = value
    .toLowerCase()
    .trim()
    .replace(SLUG_REGEX, "-")
    .replace(/^-+|-+$/g, "");
  return base ? `${base}-${suffix}` : suffix;
}

const attachmentSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false },
);

const newsSchema = new Schema<NewsDocument>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    summary: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
      index: true,
    },
    published: {
      type: Boolean,
      default: false,
    },
    publish_at: {
      type: Date,
      default: null,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
  },
  { timestamps: true },
);

newsSchema.pre("validate", function () {
  if (this.slug) return;
  this.slug = slugify(this.title || "");
});

newsSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const obj = ret as unknown as Record<string, unknown>;
    delete obj.__v;
    return ret;
  },
});

export const News: Model<NewsDocument> = model<NewsDocument>(
  "News",
  newsSchema,
);
