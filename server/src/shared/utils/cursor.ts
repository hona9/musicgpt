import { CursorData } from "../types/pagination.types";

export function encodeCursor(id: string, createdAt: Date): string {
  return Buffer.from(JSON.stringify({ id, createdAt: createdAt.toISOString() })).toString("base64");
}

export function decodeCursor(cursor: string): CursorData | null {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"));
    return { id: parsed.id, createdAt: new Date(parsed.createdAt) };
  } catch {
    return null;
  }
}

export interface SearchCursorData {
  score: number;
  createdAt: Date;
  id: string;
}

export function encodeSearchCursor(score: number, createdAt: Date, id: string): string {
  return Buffer.from(JSON.stringify({ score, createdAt: createdAt.toISOString(), id })).toString("base64");
}

export function decodeSearchCursor(cursor: string): SearchCursorData | null {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"));
    return { score: Number(parsed.score), createdAt: new Date(parsed.createdAt), id: parsed.id };
  } catch {
    return null;
  }
}
