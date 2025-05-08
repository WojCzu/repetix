import { defineMiddleware } from "astro:middleware";
import { createSupabaseClient } from "../db/supabase.client";

const PROTECTED_ROUTES = ["/generate", "/review", "/settings", "/flashcards"];
const AUTH_ROUTES = ["/login", "/register", "/reset-password"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, url } = context;

  const supabase = createSupabaseClient({
    cookies,
    headers: context.request.headers,
  });

  context.locals.supabase = supabase;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Add user to locals if authenticated
  if (user && !error) {
    context.locals.user = user;
  }

  // Handle protected routes
  if (PROTECTED_ROUTES.some((route) => url.pathname.startsWith(route)) && !user) {
    return context.redirect(`/login?redirectTo=${encodeURIComponent(url.pathname)}`);
  }

  // Handle auth routes for logged-in users
  if (AUTH_ROUTES.some((route) => url.pathname.startsWith(route)) && user) {
    return context.redirect("/");
  }

  return next();
});
