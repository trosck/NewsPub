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

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}
