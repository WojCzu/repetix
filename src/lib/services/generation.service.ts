import crypto from "crypto";
import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateGenerationResponseDto } from "../../types";
import { OpenRouterService } from "./openrouter.service";
import { OPENROUTER_DEFAULTS } from "../constants/openrouter.constants";
import { flashcardGenerationSchema, type FlashcardsResponseType } from "../schemas/openrouter.schema";

export class GenerationService {
  private static createOpenRouterService(): OpenRouterService {
    if (!import.meta.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY environment variable is not set");
    }

    return new OpenRouterService(
      import.meta.env.OPENROUTER_API_KEY,
      "openai/gpt-4o-mini",
      {
        // Controls randomness (0-1). Lower values make output more focused and deterministic
        temperature: 0.4,
        // Nucleus sampling - only consider tokens comprising the top 80% of probability mass
        top_p: 0.8,
        // Reduces repetition by penalizing tokens based on their frequency in the text so far
        frequency_penalty: 0.5,
        // Reduces repetition by penalizing tokens that appear in the text at all
        presence_penalty: 0.5,
      },
      OPENROUTER_DEFAULTS.API_URL
    );
  }

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly openRouter: OpenRouterService = GenerationService.createOpenRouterService()
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
      const systemMessage = `You are an expert at creating flashcards. Create flashcards from the provided text. 
Each flashcard should have a front_text (question/prompt) and back_text (answer/explanation).
Follow these rules:
1. Front text must be ≤200 characters and be a clear, focused question or prompt
2. Back text must be ≤500 characters and provide a complete, accurate answer
3. Each flashcard should cover a single, important concept
4. Use clear, concise language
5. Ensure accuracy and factual correctness
6. Format response as JSON with array of flashcard objects`;

      const response = await this.openRouter.sendChatCompletion<FlashcardsResponseType>(systemMessage, text, {
        responseFormat: {
          type: "json_schema",
          json_schema: {
            name: "flashcard_generation",
            schema: flashcardGenerationSchema,
          },
        },
      });

      const candidates = response.candidates;

      // Calculate metadata
      const inputLength = text.length;
      const inputHash = crypto.createHash("md5").update(text).digest("hex");
      const generationDuration = Date.now() - startTime;

      // Create generation record
      const { data: generation, error: insertError } = await this.supabase
        .from("generations")
        .insert({
          user_id: userId,
          input_length: inputLength,
          input_hash: inputHash,
          generated_count: candidates.length,
          generation_duration: generationDuration,
        })
        .select(
          `
          id,
          input_length,
          generated_count,
          generation_duration
        `
        )
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
      model: this.openRouter.defaultModel,
    });
  }
}
