export enum NewsEventType {
  Created = "news:created",
  Updated = "news:updated",
  Deleted = "news:deleted",
}

export interface NewsEvent {
  type: NewsEventType;
  data: { id: string };
}
