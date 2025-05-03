import { z } from "zod";
import type { FlashcardSource } from "../../types";

export const flashcardSourceEnum = z.enum(["manual", "ai-full", "ai-edited"]) satisfies z.ZodType<FlashcardSource>;

const manualFlashcardSchema = z.object({
  generation_id: z.literal(null),
  front_text: z.string().max(200, "Front text must not exceed 200 characters"),
  back_text: z.string().max(500, "Back text must not exceed 500 characters"),
  source: z.literal("manual"),
});

const aiFlashcardSchema = z.object({
  generation_id: z.string().uuid(),
  front_text: z.string().max(200, "Front text must not exceed 200 characters"),
  back_text: z.string().max(500, "Back text must not exceed 500 characters"),
  source: z.enum(["ai-full", "ai-edited"]),
});

export const createFlashcardSchema = z.discriminatedUnion("source", [manualFlashcardSchema, aiFlashcardSchema]);

export const createFlashcardsSchema = z.object({
  cards: z
    .array(createFlashcardSchema)
    .min(1, "At least one flashcard is required")
    .max(100, "Cannot create more than 100 flashcards at once"),
});
