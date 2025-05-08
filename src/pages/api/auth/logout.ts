import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ locals, redirect }) => {
  try {
    const { error } = await locals.supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        { status: 400 }
      );
    }

    // Redirect to login page after successful logout
    return redirect("/login");
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      { status: 500 }
    );
  }
};
