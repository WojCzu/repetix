import { z } from "zod";

export const textInputSchema = z.object({
  text: z
    .string()
    .min(1000, "Text must be at least 1,000 characters")
    .max(10000, "Text must not exceed 10,000 characters"),
});

export type GenerateFormData = z.infer<typeof textInputSchema>;
