// -----------------------------------------------------------------------------
// Core imports from DB row definitions
// -----------------------------------------------------------------------------
import type { Tables } from "./db/database.types";

//
// Underlying entity Row types
//
export type GenerationRow = Tables<"generations">;
export type FlashcardRow = Tables<"flashcards">;
export type GenerationErrorLogRow = Tables<"generation_error_logs">;

// -----------------------------------------------------------------------------
// Shared types
// -----------------------------------------------------------------------------

/**
 * Pagination information returned by list endpoints.
 */
export interface PaginationDto {
  page: number;
  pageSize: number;
  total: number;
}

// -----------------------------------------------------------------------------
// Generation Resource
// -----------------------------------------------------------------------------

/**
 * Command model for creating a new AI Generation.
 * Matches POST /api/generations request body.
 */
export interface CreateGenerationCommand {
  /** Raw input text to generate flashcards from (1k–10k chars) */
  text: string;
}

/**
 * A single generated flashcard candidate from the AI service.
 * We derive the shape from FlashcardRow to keep consistency.
 */
export type GenerationCandidateDto = Pick<FlashcardRow, "front_text" | "back_text">;

/**
 * Response for a newly created generation.
 * Matches POST /api/generations 201 body.
 */
export type CreateGenerationResponseDto = Pick<
  GenerationRow,
  "id" | "input_length" | "generated_count" | "generation_duration"
> & {
  candidates: GenerationCandidateDto[];
};

/**
 * Summary of a generation in a paginated list.
 * Used in GET /api/generations list items.
 */
export type GenerationSummaryDto = Pick<
  GenerationRow,
  | "id"
  | "input_length"
  | "generated_count"
  | "accepted_unedited_count"
  | "accepted_edited_count"
  | "generation_duration"
  | "created_at"
>;

/**
 * Detailed generation info, including AI candidates.
 * Matches GET /api/generations/:generationId response.
 */
export type GenerationDetailDto = GenerationSummaryDto & {
  candidates: GenerationCandidateDto[];
};

/**
 * Wrapper for GET /api/generations response.
 */
export interface ListGenerationsResponseDto {
  data: GenerationSummaryDto[];
  pagination: PaginationDto;
}

/**
 * Alias for GET /api/generations/:generationId response.
 */
export type GetGenerationResponseDto = GenerationDetailDto;

/**
 * A single generation error log entry.
 * Matches GET /api/generations/:generationId/errors items.
 */
export type GenerationErrorDto = Pick<
  GenerationErrorLogRow,
  "id" | "model" | "source_text_hash" | "source_text_length" | "error_code" | "error_message" | "created_at"
>;

/**
 * Alias for GET /api/generations/:generationId/errors response.
 */
export type GetGenerationErrorsResponseDto = GenerationErrorDto[];

// -----------------------------------------------------------------------------
// Flashcard Resource
// -----------------------------------------------------------------------------

/**
 * Allowed 'source' values when creating flashcards.
 */
export type FlashcardSource = "manual" | "ai-full" | "ai-edited";

/**
 * Allowed 'source' values when updating flashcards.
 * Per API, 'ai-full' cannot be set on update.
 */
export type FlashcardUpdateSource = "manual" | "ai-edited";

/**
 * Command model for creating one or more flashcards.
 * Matches POST /api/flashcards request body.
 */
export interface CreateFlashcardsCommandDto {
  cards: (Pick<FlashcardRow, "generation_id" | "front_text" | "back_text"> & {
    source: FlashcardSource;
  })[];
}

/**
 * Shape of a flashcard in all response payloads.
 * Excludes internal `user_id` field.
 */
export type FlashcardDto = Omit<FlashcardRow, "user_id">;

/**
 * Response for POST /api/flashcards.
 */
export interface CreateFlashcardsResponseDto {
  cards: FlashcardDto[];
}

/**
 * Command model for updating an existing flashcard.
 * Matches PUT /api/flashcards/:id request body.
 */
export type UpdateFlashcardCommandDto = Pick<FlashcardRow, "front_text" | "back_text"> & {
  source: FlashcardUpdateSource;
};

/**
 * Wrapper for GET /api/flashcards list response.
 */
export interface ListFlashcardsResponseDto {
  data: FlashcardDto[];
  pagination: PaginationDto;
}

/**
 * Alias for GET /api/flashcards/:id and PUT /api/flashcards/:id response.
 */
export type GetFlashcardResponseDto = FlashcardDto;

// -----------------------------------------------------------------------------
// UI View Models
// -----------------------------------------------------------------------------

/**
 * Represents a flashcard candidate in the UI state before saving.
 */
export interface ViewModelCandidate {
  /** Unique client-side ID for tracking the candidate */
  id: string;
  /** Text on the front of the card (≤ 200 chars) */
  front_text: string;
  /** Text on the back of the card (≤ 500 chars) */
  back_text: string;
  /** Whether the user has accepted this candidate */
  isAccepted: boolean;
  /** Whether the candidate has been edited by the user */
  isEdited: boolean;
}
