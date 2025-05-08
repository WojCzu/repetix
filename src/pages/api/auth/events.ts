import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals, request }) => {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // Set up auth state change listener
  const {
    data: { subscription },
  } = locals.supabase.auth.onAuthStateChange(async (_event, session) => {
    // Verify user with auth server
    const {
      data: { user },
    } = await locals.supabase.auth.getUser();
    const data = JSON.stringify({ user });
    await writer.write(encoder.encode(`data: ${data}\n\n`));
  });

  // Send initial state
  const {
    data: { user },
  } = await locals.supabase.auth.getUser();
  await writer.write(encoder.encode(`data: ${JSON.stringify({ user })}\n\n`));

  // Clean up subscription when client disconnects
  request.signal.addEventListener("abort", () => {
    subscription.unsubscribe();
    writer.close();
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};
