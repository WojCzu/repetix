import { z } from "zod";
import type { FlashcardSource } from "../../types";

// Base constraints for flashcard text fields
export const flashcardTextConstraints = {
  front_text: {
    max: 200,
    message: "Front text must not exceed 200 characters",
  },
  back_text: {
    max: 500,
    message: "Back text must not exceed 500 characters",
  },
} as const;

// Base schema for flashcard text fields
export const flashcardTextSchema = z.object({
  front_text: z
    .string()
    .min(1, "Front text is required")
    .max(flashcardTextConstraints.front_text.max, flashcardTextConstraints.front_text.message)
    .trim(),
  back_text: z
    .string()
    .min(1, "Back text is required")
    .max(flashcardTextConstraints.back_text.max, flashcardTextConstraints.back_text.message)
    .trim(),
});

// Source enum
export const flashcardSourceEnum = z.enum(["manual", "ai-full", "ai-edited"]) satisfies z.ZodType<FlashcardSource>;

// Schema for manually created flashcards
export const manualFlashcardSchema = flashcardTextSchema.extend({
  generation_id: z.literal(null),
  source: z.literal("manual"),
});

// Schema for AI-generated flashcards
export const aiFlashcardSchema = flashcardTextSchema.extend({
  generation_id: z.string().uuid(),
  source: z.enum(["ai-full", "ai-edited"]),
});

// Schema for creating single flashcard (discriminated union)
export const createFlashcardSchema = z.discriminatedUnion("source", [manualFlashcardSchema, aiFlashcardSchema]);

// Schema for creating multiple flashcards
export const createFlashcardsSchema = z.object({
  cards: z
    .array(createFlashcardSchema)
    .min(1, "At least one flashcard is required")
    .max(100, "Cannot create more than 100 flashcards at once"),
});

// Type exports
export type FlashcardFormData = z.infer<typeof flashcardTextSchema>;
export type CreateFlashcardData = z.infer<typeof createFlashcardSchema>;
export type CreateFlashcardsData = z.infer<typeof createFlashcardsSchema>;
