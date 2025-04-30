# REST API Plan

## 1. Resources

- **User** (auth.users)
- **Generation** (generations)
- **Flashcard** (flashcards)
- **GenerationErrorLog** (generation_error_logs)
- **ReviewSession** (ephemeral workflow, no dedicated table)

## 2. Endpoints

All endpoints below require authentication via `Authorization: Bearer <accessToken>` unless noted.

### 2.1 Generation Resource

#### POST /api/generations

- Description: Submit text for AI flashcard generation.
- Request Body (`application/json`):
  ```json
  { "text": "string" }
  ```
- Validations:
  - `text.length` must be between 1000 and 10000 characters.
- Responses:
  - `201 Created`:
    ```json
    {
      "id": "uuid",
      "input_length": number,
      "generated_count": number,
      "generation_duration": number,
      "candidates": [
        { "front_text": "string", "back_text": "string" },
        ...
      ]
    }
    ```
  - `400 Bad Request` for validation errors
  - `429 Too Many Requests` if rate limit exceeded
  - `500 Internal Server Error` on AI service failure

#### GET /api/generations

- Description: List past AI generation records.
- Query Parameters:
  - `page` (int, default=1)
  - `pageSize` (int, default=20)
  - `sortBy` (`created_at`)
  - `sortOrder` (`asc`|`desc`)
- Response (`200 OK`):
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "input_length": number,
        "generated_count": number,
        "accepted_unedited_count": number,
        "accepted_edited_count": number,
        "generation_duration": number,
        "created_at": "ISO8601"
      },
      ...
    ],
    "pagination": { "page": number, "pageSize": number, "total": number }
  }
  ```

#### GET /api/generations/:generationId

- Description: Retrieve details and AI candidates for one generation.
- Path Parameters:
  - `generationId` (UUID)
- Response (`200 OK`):
  ```json
  {
    "id": "uuid",
    "input_length": number,
    "generated_count": number,
    "accepted_unedited_count": number,
    "accepted_edited_count": number,
    "generation_duration": number,
    "created_at": "ISO8601",
    "candidates": [
      { "front_text": "string", "back_text": "string" },
      ...
    ]
  }
  ```
- Errors:
  - `404 Not Found` if the record does not exist or is not owned by the user

#### GET /api/generations/:generationId/errors

- Description: List AI generation error logs for a generation.
- Response (`200 OK`):
  ```json
  [
    {
      "id": "uuid",
      "model": "string",
      "source_text_hash": "string",
      "source_text_length": number,
      "error_code": "string",
      "error_message": "string",
      "created_at": "ISO8601"
    },
    ...
  ]
  ```

### 2.2 Flashcard Creation & CRUD

#### POST /api/flashcards

- Description: Create one or multiple flashcards (manual or AI-generated).
- Request Body (`application/json`):
  ```json
  {
    "cards": [
      { "generation_id": "uuid | null", "front_text": "string", "back_text": "string", "source": "manual" | "ai-full" | "ai-edited" }
    ]
  }
  ```
- Validations:
  - Each `front_text` ≤200 chars, each `back_text` ≤500 chars.
  - `source` must be one of `manual`, `ai-full`, `ai-edited`.
- Responses:
  - `201 Created`:
    ```json
    {
      "cards": [
        {
          "id": "uuid",
          "generation_id": "uuid | null",
          "front_text": "string",
          "back_text": "string",
          "source": "manual" | "ai-full" | "ai-edited",
          "created_at": "ISO8601",
          "updated_at": "ISO8601"
        }
      ]
    }
    ```
- Errors:
  - `400 Bad Request` for validation failures.

#### GET /api/flashcards

- Description: List all user flashcards.
- Query Parameters:
  - `page` (int, default=1)
  - `pageSize` (int, default=20)
  - `sortBy` (`created_at`)
  - `sortOrder` (`asc`|`desc`)
  - `source` filter (`ai-full`|`ai-edited`|`manual`)
- Response (`200 OK`):
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "generation_id": "uuid | null",
        "front_text": "string",
        "back_text": "string",
        "source": "string",
        "created_at": "ISO8601",
        "updated_at": "ISO8601"
      },
      ...
    ],
    "pagination": { "page": number, "pageSize": number, "total": number }
  }
  ```

#### GET /api/flashcards/:id

- Description: Retrieve a single flashcard.
- Path Parameters:
  - `id` (UUID)
- Response (`200 OK`): flashcard object with fields `id`, `generation_id`, `front_text`, `back_text`, `source`, `created_at`, `updated_at`.
- Errors: `404 Not Found`

#### PUT /api/flashcards/:id

- Description: Edit an existing flashcard. If editing an AI-generated card, its `source` must change to `ai-edited`.
- Request Body (`application/json`):
  ```json
  {
    "front_text": "string",
    "back_text": "string",
    "source": "manual" | "ai-edited"
  }
  ```
- Validations:
  - `front_text` ≤200 chars, `back_text` ≤500 chars.
  - `source` must be one of `manual`, `ai-edited`.
- Responses:
  - `200 OK`:
    ```json
    {
      "id": "uuid",
      "generation_id": "uuid | null",
      "front_text": "string",
      "back_text": "string",
      "source": "manual" | "ai-edited",
      "created_at": "ISO8601",
      "updated_at": "ISO8601"
    }
    ```
- Errors:
  - `400 Bad Request`, `404 Not Found`

#### DELETE /api/flashcards/:id

- Description: Delete a flashcard.
- Response:
  - `204 No Content`
- Errors: `404 Not Found`

## 3. Authentication & Authorization

- Mechanism: Supabase Auth (JWT/Bearer tokens).
- Protected endpoints require `Authorization: Bearer <accessToken>` header.
- RLS policies enforce user ownership on `generations`, `flashcards`, and `generation_error_logs`.
- Public endpoints: password reset request (`/api/auth/forgot-password`) and reset completion (`/api/auth/reset-password`).
- Security considerations: HTTPS everywhere, CORS restricted to front-end origin, input sanitization, JWT security best practices.

## 4. Validation & Business Logic

- **Generation workflow**:

  1. Validate `text` length (1000–10000 chars) and return 400 on violation.
  2. Compute `input_hash` via HMAC-SHA256 with global secret.
  3. Begin DB transaction: insert new `generations` record with `user_id`, `input_hash`, `input_length`, `generated_count=0`, timestamps.
  4. Invoke AI service and measure duration.
  5. Receive candidate list (1–3 cards per 1000 chars), enforce each `front_text` ≤200 and `back_text` ≤500; discard or truncate invalid ones.
  6. Update `generations.generated_count` and `generations.generation_duration` in DB.
  7. Commit transaction and return candidates in response.
  8. On AI or DB error: rollback transaction; insert an error record in `generation_error_logs` with `model`, `errorCode`, `errorMessage`, then return 500.

- **AI Candidate Acceptance & Saving**:

  1. On POST `/api/flashcards` for AI-generated cards (`source` in [`ai-full`, `ai-edited`]): begin transaction.
  2. Insert each card into `flashcards` with `generation_id` if provided.
  3. Increment `generations.accepted_unedited_count` for `ai-full` cards and `generations.accepted_edited_count` for `ai-edited` cards.
  4. Commit and return saved cards; on failure, rollback and return 400 or 404.

- **Text length**: 1000–10000 chars for generation input (`generations.input_length` constraint).
- **Flashcard text limits**: `front_text` ≤200 chars, `back_text` ≤500 chars (`flashcards.front_text`, `flashcards.back_text`).
- **Source field**:
  - On creation: must be one of `manual`, `ai-full`, `ai-edited`.
  - On update: must be one of `manual`, `ai-edited` (no `ai-full`).
- **Pagination & Sorting**: support `page`, `pageSize`, `sortBy`, `sortOrder` on list endpoints.
- **Rate limiting**: apply on POST `/api/generations` (e.g., max 5 requests/min).
- **Error handling**: use guard clauses; return structured errors with HTTP code and message.
