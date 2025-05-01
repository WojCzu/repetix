import type { APIRoute } from "astro";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import { GenerationService } from "../../lib/services/generation.service";
import { createGenerationSchema } from "../../lib/schemas/generation.schema";
import { AIService } from "../../lib/services/ai.service";

export const prerender = false;

// Initialize AI service once for all requests to this endpoint
const aiService = new AIService();

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();

    // Validate request body
    const result = createGenerationSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "ValidationError",
          message: "Invalid request data",
          details: result.error.issues,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Initialize generation service with dependencies
    const generationService = new GenerationService(locals.supabase, aiService);

    // Generate flashcards
    const response = await generationService.generateFlashcards(DEFAULT_USER_ID, result.data.text);

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "UnknownError";
    const errorMessage = error instanceof Error ? error.message : String(error);

    return new Response(
      JSON.stringify({
        error: errorName,
        message: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
