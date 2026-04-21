export type SearchItemType = "user" | "audio";

export interface SearchItemEntity {
  type: SearchItemType;
  id: string;
  display: string;
  tier?: string | undefined;
  audioUrl?: string | null | undefined;
  promptText?: string | undefined;
  createdAt: Date;
  score: number;
}
