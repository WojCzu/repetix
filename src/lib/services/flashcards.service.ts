import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateFlashcardsCommandDto, FlashcardDto } from "../../types";

export class FlashcardsService {
  constructor(private readonly supabase: SupabaseClient) {}

  async createCards(userId: string, cards: CreateFlashcardsCommandDto["cards"]): Promise<FlashcardDto[]> {
    const { data, error } = await this.supabase.from("flashcards").insert(
      cards.map((card) => ({
        ...card,
        user_id: userId,
      }))
    ).select(`
        id,
        generation_id,
        front_text,
        back_text,
        source,
        created_at,
        updated_at
      `);

    if (error) {
      console.error("Error creating flashcards:", error);
      throw new Error("Failed to create flashcards");
    }

    return data;
  }
}
