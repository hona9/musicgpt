import { z } from "zod";

export const SearchSchema = z.object({
  q: z.string().min(1, "Search query is required.").max(200),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type SearchQuery = z.infer<typeof SearchSchema>;
