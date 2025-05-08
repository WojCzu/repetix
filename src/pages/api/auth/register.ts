import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email, password } = await request.json();

    const { data, error } = await locals.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/login`,
      },
    });

    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        user: data.user,
        message: "Please check your email for verification link",
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
      }),
      { status: 500 }
    );
  }
};
