import { z } from "zod";

export const CreatePromptSchema = z.object({
  text: z.string().min(1, "Prompt text is required.").max(500, "Prompt text is too long."),
});

export type CreatePromptDto = z.infer<typeof CreatePromptSchema>;
