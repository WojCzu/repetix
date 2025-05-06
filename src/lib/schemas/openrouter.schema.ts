import { z } from "zod";
import { flashcardTextSchema } from "./flashcard.schema";

// Base schema for default chat responses
export const defaultResponseSchema = {
  type: "object",
  properties: {
    reply: {
      type: "string",
      description: "The response text",
    },
    usage: {
      type: "object",
      properties: {
        prompt_tokens: {
          type: "number",
          description: "Number of tokens in the prompt",
        },
        completion_tokens: {
          type: "number",
          description: "Number of tokens in the completion",
        },
      },
      required: ["prompt_tokens", "completion_tokens"],
    },
  },
  required: ["reply", "usage"],
} as const;

// Schema for flashcard generation - minimalna wersja wymagana przez Azure
export const flashcardGenerationSchema = {
  type: "object",
  properties: {
    candidates: {
      type: "array",
      items: {
        type: "object",
        properties: {
          front_text: {
            type: "string",
            description: "Question or prompt for the flashcard (max 200 chars)",
          },
          back_text: {
            type: "string",
            description: "Answer or explanation for the flashcard (max 500 chars)",
          },
        },
        required: ["front_text", "back_text"],
      },
    },
  },
  required: ["candidates"],
} as const;

// Zod schemas for response validation
export const chatResponseSchema = z.object({
  reply: z.string(),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
  }),
});

// Extend flashcard schema from base text schema
export const flashcardsResponseSchema = z.object({
  candidates: z.array(flashcardTextSchema),
});

// Response types
export type ChatResponseType = z.infer<typeof chatResponseSchema>;
export type FlashcardsResponseType = z.infer<typeof flashcardsResponseSchema>;
