import type { APIRoute } from "astro";
import { FlashcardsService } from "../../../lib/services/flashcards.service";
import { flashcardIdSchema, updateFlashcardSchema } from "../../../lib/schemas/flashcard.schema";

export const prerender = false;

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Get user from locals (set by middleware)
    const user = locals.user;

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate flashcard ID
    const result = flashcardIdSchema.safeParse({ id: params.id });

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: result.error.flatten(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Delete flashcard
    const service = new FlashcardsService(locals.supabase);
    await service.deleteFlashcard(user.id, result.data.id);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error processing flashcard deletion:", error);

    if (error instanceof Error) {
      if (error.message === "Flashcard not found") {
        return new Response(JSON.stringify({ error: "Flashcard not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const PUT: APIRoute = async ({ request, params, locals }) => {
  try {
    // Get user from locals (set by middleware)
    const user = locals.user;

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate flashcard ID
    const idResult = flashcardIdSchema.safeParse({ id: params.id });

    if (!idResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: idResult.error.flatten(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const bodyResult = updateFlashcardSchema.safeParse(body);

    if (!bodyResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: bodyResult.error.flatten(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Update flashcard
    const service = new FlashcardsService(locals.supabase);
    const updatedCard = await service.updateFlashcard(user.id, idResult.data.id, bodyResult.data);

    return new Response(JSON.stringify(updatedCard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing flashcard update:", error);

    if (error instanceof Error) {
      if (error.message === "Flashcard not found") {
        return new Response(JSON.stringify({ error: "Flashcard not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    // Get user from locals (set by middleware)
    const user = locals.user;

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate flashcard ID
    const result = flashcardIdSchema.safeParse({ id: params.id });

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: result.error.flatten(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get flashcard from service
    const service = new FlashcardsService(locals.supabase);
    const flashcard = await service.getFlashcardById(user.id, result.data.id);

    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing flashcard request:", error);

    if (error instanceof Error) {
      if (error.message === "Flashcard not found") {
        return new Response(JSON.stringify({ error: "Flashcard not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
