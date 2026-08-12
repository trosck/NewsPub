import type { Article, Attachment } from "../types.ts";
import { request } from "./http.ts";

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  summary?: string;
  category?: string;
  attachments?: Attachment[];
  createdAt: string;
}

export interface ArticleInput {
  title: string;
  body: string;
  summary?: string;
  category?: string;
  attachments?: Attachment[];
}

function toArticle(news: NewsItem): Article {
  return {
    id: news._id,
    title: news.title,
    body: news.content,
    summary: news.summary,
    category: news.category,
    attachments: news.attachments ?? [],
    createdAt: new Date(news.createdAt).getTime(),
  };
}

export async function listArticles(): Promise<Article[]> {
  const data = await request<{ items: NewsItem[] }>("/api/news");
  return data.items.map(toArticle);
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  const data = await request<{ news: NewsItem }>("/api/news", {
    method: "POST",
    body: JSON.stringify({
      title: input.title,
      content: input.body,
      summary: input.summary,
      category: input.category,
      attachments: input.attachments,
      published: true,
    }),
  });
  return toArticle(data.news);
}

export async function updateArticle(
  id: string,
  input: ArticleInput,
): Promise<Article> {
  const data = await request<{ news: NewsItem }>(`/api/news/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      title: input.title,
      content: input.body,
      summary: input.summary,
      category: input.category,
      attachments: input.attachments,
    }),
  });
  return toArticle(data.news);
}

export async function deleteArticle(id: string): Promise<void> {
  await request<unknown>(`/api/news/${id}`, { method: "DELETE" });
}
