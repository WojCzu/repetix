import { z } from "zod";

/**
 * Schema for validating generation creation requests
 */
export const createGenerationSchema = z.object({
  text: z
    .string()
    .min(1000, "Text must be at least 1,000 characters long")
    .max(10000, "Text must not exceed 10,000 characters"),
});

export type CreateGenerationSchema = typeof createGenerationSchema;
