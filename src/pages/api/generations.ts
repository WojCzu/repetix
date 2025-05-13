import type { APIRoute } from "astro";
import { GenerationService } from "../../lib/services/generation.service";
import { createGenerationSchema } from "../../lib/schemas/generation.schema";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get user from locals (set by middleware)
    const user = locals.user;

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

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
    const generationService = new GenerationService(locals.supabase);

    // Generate flashcards
    const response = await generationService.generateFlashcards(user.id, result.data.text);

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
