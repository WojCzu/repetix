import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateGenerationResponseDto } from "../../types";
import { AIService } from "./ai.service";

export class GenerationService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly aiService: AIService
  ) {}

  /**
   * Generates flashcards from input text using AI
   * @param userId - The ID of the authenticated user
   * @param text - Raw input text to generate flashcards from
   * @returns Generation metadata and flashcard candidates
   */
  async generateFlashcards(userId: string, text: string): Promise<CreateGenerationResponseDto> {
    const startTime = Date.now();

    try {
      // Generate flashcards using AI service
      const candidates = await this.aiService.generateFlashcards(text);

      // Calculate metadata
      const inputLength = text.length;
      const inputHash = crypto.createHash("md5").update(text).digest("hex");
      const generationDuration = Date.now() - startTime;

      // Create generation record with all data
      const { data: generation, error: insertError } = await this.supabase
        .from("generations")
        .insert({
          user_id: userId,
          input_length: inputLength,
          input_hash: inputHash,
          generated_count: candidates.length,
          generation_duration: generationDuration,
        })
        .select()
        .single();

      if (insertError || !generation) {
        throw new Error("Failed to create generation record");
      }

      // Return response
      return {
        id: generation.id,
        input_length: inputLength,
        generated_count: candidates.length,
        generation_duration: generationDuration,
        candidates,
      };
    } catch (error) {
      // Log error without generation record
      await this.logGenerationError(userId, text, error);
      throw error;
    }
  }

  /**
   * Logs generation errors to the error_logs table
   */
  private async logGenerationError(userId: string, text: string, error: unknown): Promise<void> {
    const errorCode = error instanceof Error ? error.name : "UnknownError";
    const errorMessage = error instanceof Error ? error.message : String(error);
    const inputHash = crypto.createHash("md5").update(text).digest("hex");

    await this.supabase.from("generation_error_logs").insert({
      user_id: userId,
      source_text_hash: inputHash,
      source_text_length: text.length,
      error_code: errorCode,
      error_message: errorMessage,
      model: "mock",
    });
  }
}
