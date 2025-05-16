import { test as teardown } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/db/database.types";

teardown("delete test data from database", async () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY || !process.env.E2E_USERNAME_ID) {
    throw new Error("Required environment variables are not set");
  }

  // Create Supabase client
  const supabase = createClient<Database>(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  try {
    console.log("Cleaning up test data...");

    // Delete all flashcards for the test user
    const { error: deleteError } = await supabase
      .from("flashcards")
      .delete()
      .eq("user_id", process.env.E2E_USERNAME_ID);

    if (deleteError) {
      console.error("Error deleting flashcards:", deleteError.message);
      throw deleteError;
    }

    console.log("Test data cleanup completed successfully");
  } catch (error) {
    console.error("Failed to clean up test data:", error);
    throw error;
  }
});
