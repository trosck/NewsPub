import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Model, Schema as MongooseSchema, Types } from "mongoose";

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface NewsDocument extends Document<Types.ObjectId> {
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
  _id: Types.ObjectId;
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

const attachmentSchema = new MongooseSchema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false },
);

@Schema({ timestamps: true })
export class News {
  @Prop({
    type: String,
    required: [true, "Title is required"],
    trim: true,
    minlength: [3, "Title must be at least 3 characters"],
  })
  title: string;

  @Prop({ type: String, required: [true, "Content is required"] })
  content: string;

  @Prop({ type: String, trim: true })
  summary?: string;

  @Prop({ type: String, trim: true, index: true })
  category?: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  author: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  published: boolean;

  @Prop({ type: Date, default: null, index: true })
  publish_at: Date | null;

  @Prop({ type: String, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ type: [attachmentSchema], default: [] })
  attachments: Attachment[];
}

export const NewsSchema = SchemaFactory.createForClass(News);

NewsSchema.pre("validate", function (this: NewsDocument) {
  if (this.slug) return;
  this.slug = slugify(this.title || "");
});

NewsSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const obj = ret as unknown as Record<string, unknown>;
    delete obj.__v;
    return ret;
  },
});

export type NewsModel = Model<NewsDocument>;
