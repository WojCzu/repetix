import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  try {
    const {
      data: { user },
      error,
    } = await locals.supabase.auth.getUser();

    if (error) {
      return new Response(
        JSON.stringify({
          user: null,
        }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({
        user,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      { status: 500 }
    );
  }
};
