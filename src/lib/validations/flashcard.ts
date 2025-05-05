import { z } from "zod";

export const flashcardSchema = z.object({
  front_text: z.string().min(1, "Front text is required").max(200, "Front text cannot exceed 200 characters").trim(),
  back_text: z.string().min(1, "Back text is required").max(500, "Back text cannot exceed 500 characters").trim(),
});

export type FlashcardFormData = z.infer<typeof flashcardSchema>;
