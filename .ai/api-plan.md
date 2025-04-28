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
      "generatedCount": number,
      "candidates": [
        { "frontText": "string", "backText": "string" },
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
        "inputLength": number,
        "generatedCount": number,
        "acceptedUneditedCount": number,
        "acceptedEditedCount": number,
        "createdAt": "ISO8601"
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
    "inputLength": number,
    "generatedCount": number,
    "acceptedUneditedCount": number,
    "acceptedEditedCount": number,
    "createdAt": "ISO8601",
    "candidates": [
      { "frontText": "string", "backText": "string" },
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
      "errorCode": "string",
      "errorMessage": "string",
      "createdAt": "ISO8601"
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
      { "frontText": "string", "backText": "string", "source": "manual" | "ai-full" | "ai-edited" }
    ]
  }
  ```
- Validations:
  - Each `frontText` ≤200 chars, each `backText` ≤500 chars.
  - `source` must be one of `manual`, `ai-full`, `ai-edited`.
- Responses:
  - `201 Created`: returns created flashcards array in JSON.
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
        "frontText": "string",
        "backText": "string",
        "source": "string",
        "createdAt": "ISO8601"
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
- Response (`200 OK`): flashcard object
- Errors: `404 Not Found`

#### PUT /api/flashcards/:id

- Description: Edit an existing flashcard. If editing an AI-generated card, its `source` must change to `ai-edited`.
- Request Body (`application/json`):
  ```json
  {
    "frontText": "string",
    "backText": "string",
    "source": "manual" | "ai-edited"
  }
  ```
- Validations:
  - `frontText` ≤200 chars, `backText` ≤500 chars.
  - `source` must be one of `manual`, `ai-edited`.
- Responses:
  - `200 OK` with updated flashcard JSON.
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

- **Text length**: 1000–10000 chars for generation input (`generations.input_length` constraint).
- **Flashcard text limits**: `frontText` ≤200 chars, `backText` ≤500 chars (`flashcards.front_text`, `flashcards.back_text`).
- **Source field**:
  - On creation: must be one of `manual`, `ai-full`, `ai-edited`.
  - On update: must be one of `manual`, `ai-edited` (no longer `ai-full`).
- **AI metrics**: increment `generations.generated_count` on POST `/api/generations`; update `accepted_unedited_count` and `accepted_edited_count` on bulk flashcard creation.
- **Error logging**: capture AI service failures to `generation_error_logs` (`model`, `errorCode`, `errorMessage`).
- **Pagination & Sorting**: support `page`, `pageSize`, `sortBy`, `sortOrder` on all list endpoints.
- **Rate limiting**: apply on POST `/api/generations` (e.g., max 5 requests/min) to protect AI quotas.
- **Error handling**: use guard clauses, return structured error responses with HTTP status code and descriptive message.
