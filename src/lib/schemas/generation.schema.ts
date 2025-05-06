import { z } from "zod";
import { flashcardTextSchema, flashcardTextConstraints } from "./flashcard.schema";

// Text input constraints
const textInputConstraints = {
  min: 1000,
  max: 10000,
  messages: {
    min: "Text must be at least 1,000 characters",
    max: "Text must not exceed 10,000 characters",
  },
} as const;

// Base schema for text input validation
export const textInputSchema = z.object({
  text: z
    .string()
    .min(textInputConstraints.min, textInputConstraints.messages.min)
    .max(textInputConstraints.max, textInputConstraints.messages.max),
});

/**
 * Schema for validating generation creation requests
 * Extends the base text input schema with any additional generation-specific validations
 */
export const createGenerationSchema = textInputSchema;

// Schema for AI generation response validation (Zod)
export const generationResponseSchema = z.object({
  candidates: z.array(flashcardTextSchema),
});

// JSON Schema for OpenRouter API response format
export const openRouterGenerationSchema = {
  type: "object",
  properties: {
    candidates: {
      type: "array",
      items: {
        type: "object",
        properties: {
          front_text: {
            type: "string",
            maxLength: flashcardTextConstraints.front_text.max,
          },
          back_text: {
            type: "string",
            maxLength: flashcardTextConstraints.back_text.max,
          },
        },
        required: ["front_text", "back_text"],
        additionalProperties: false,
      },
    },
  },
  required: ["candidates"],
  additionalProperties: false,
} as const;

// Type exports
export type GenerateFormData = z.infer<typeof textInputSchema>;
export type CreateGenerationData = z.infer<typeof createGenerationSchema>;
export type GenerationResponse = z.infer<typeof generationResponseSchema>;
