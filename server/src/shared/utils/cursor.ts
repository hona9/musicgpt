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
