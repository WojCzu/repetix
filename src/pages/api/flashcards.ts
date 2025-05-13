import type { APIRoute } from "astro";
import { FlashcardsService } from "../../lib/services/flashcards.service";
import { createFlashcardsSchema } from "@/lib/schemas/flashcard.schema";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get user from locals (set by middleware)
    const user = locals.user;

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const result = createFlashcardsSchema.safeParse(body);

    if (!result.success) {
      return new Response(JSON.stringify({ errors: result.error.flatten() }), { status: 400 });
    }

    // Create flashcards
    const service = new FlashcardsService(locals.supabase);
    const cards = await service.createCards(user.id, result.data.cards);

    return new Response(JSON.stringify({ cards }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing flashcards creation:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};
