import type { SupabaseClient } from "../../db/supabase.client";
import type {
  CreateFlashcardsCommandDto,
  FlashcardDto,
  ListFlashcardsResponseDto,
  PaginationDto,
  UpdateFlashcardCommandDto,
} from "../../types";
import type { ListFlashcardsQueryParams } from "../schemas/flashcard.schema";

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

  async listUserFlashcards(userId: string, options: ListFlashcardsQueryParams): Promise<ListFlashcardsResponseDto> {
    const { page, pageSize, sortBy, sortOrder, source } = options;

    // Calculate pagination values
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Start building the query
    let query = this.supabase
      .from("flashcards")
      .select(
        `
        id,
        generation_id,
        front_text,
        back_text,
        source,
        created_at,
        updated_at,
        user_id
      `,
        { count: "exact" }
      )
      .eq("user_id", userId);

    // Apply source filter if provided
    if (source) {
      query = query.eq("source", source);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // Apply pagination
    query = query.range(from, to);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching flashcards:", error);
      throw new Error("Failed to fetch flashcards");
    }

    // Prepare pagination info
    const pagination: PaginationDto = {
      page,
      pageSize,
      total: count || 0,
    };

    // Map to DTOs by omitting user_id
    const flashcards: FlashcardDto[] = data.map(({ user_id, ...rest }) => rest);

    return {
      data: flashcards,
      pagination,
    };
  }

  async deleteFlashcard(userId: string, flashcardId: string): Promise<void> {
    const { error, count } = await this.supabase
      .from("flashcards")
      .delete()
      .match({ id: flashcardId, user_id: userId });

    if (error) {
      console.error("Error deleting flashcard:", error);
      throw new Error("Failed to delete flashcard");
    }

    if (count === 0) {
      throw new Error("Flashcard not found");
    }
  }

  async updateFlashcard(userId: string, flashcardId: string, data: UpdateFlashcardCommandDto): Promise<FlashcardDto> {
    const { data: updatedCard, error } = await this.supabase
      .from("flashcards")
      .update({
        front_text: data.front_text,
        back_text: data.back_text,
        source: data.source,
      })
      .eq("id", flashcardId)
      .eq("user_id", userId)
      .select(
        `
        id,
        generation_id,
        front_text,
        back_text,
        source,
        created_at,
        updated_at
      `
      )
      .single();

    if (error) {
      console.error("Error updating flashcard:", error);
      throw new Error("Failed to update flashcard");
    }

    if (!updatedCard) {
      throw new Error("Flashcard not found");
    }

    return updatedCard;
  }

  async getFlashcardById(userId: string, flashcardId: string): Promise<FlashcardDto> {
    const { data: flashcard, error } = await this.supabase
      .from("flashcards")
      .select(
        `
        id,
        generation_id,
        front_text,
        back_text,
        source,
        created_at,
        updated_at
      `
      )
      .eq("id", flashcardId)
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching flashcard:", error);
      throw new Error("Failed to fetch flashcard");
    }

    if (!flashcard) {
      throw new Error("Flashcard not found");
    }

    return flashcard;
  }
}
