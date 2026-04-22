import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  tier: z.enum(["FREE", "PAID"]).optional().default("FREE"),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
