export interface CursorData {
  id: string;
  createdAt: Date;
}

export interface PageResult<T> {
  items: T[];
  nextCursor: string | null;
}
