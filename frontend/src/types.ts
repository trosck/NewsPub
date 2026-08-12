export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface Article {
  id: string;
  title: string;
  body: string;
  summary?: string;
  category?: string;
  attachments?: Attachment[];
  createdAt: number;
}

export interface UserModel {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: UserModel;
  token?: string;
}

export const NEWS_EVENT_TYPE = {
  Created: "news:created",
  Updated: "news:updated",
  Deleted: "news:deleted",
} as const;

export type NewsEventType =
  (typeof NEWS_EVENT_TYPE)[keyof typeof NEWS_EVENT_TYPE];

export interface NewsEvent {
  type: NewsEventType;
  data: { id: string };
}

export type SocketStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";
