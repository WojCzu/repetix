# API Endpoint Implementation Plan: POST /api/flashcards

## 1. Przegląd punktu końcowego

Endpoint pozwala na utworzenie jednej lub wielu fiszek (flashcards) zarówno ręcznie, jak i na podstawie wyników AI. Obsługuje wsadowe wstawienie rekordów do tabeli `flashcards`, wiąże je z użytkownikiem i opcjonalnie z generacją.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- Ścieżka: `/api/flashcards`
- Nagłówki:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` (supabase JWT)
- Body (application/json):
  ```json
  {
    "cards": [
      {
        "generation_id": "uuid | null",
        "front_text": "string (≤200 chars)",
        "back_text": "string (≤500 chars)",
        "source": "manual" | "ai-full" | "ai-edited"
      }
      // ... więcej kart
    ]
  }
  ```
- Parametry:
  - Wymagane:
    - `cards: Array` (min. jedna pozycja)
    - Dla każdej karty: `front_text`, `back_text`, `source`
  - Opcjonalne:
    - `generation_id` (może być `null` dla kart manualnych)

## 3. Wykorzystywane typy

- DTO/Command:
  - `CreateFlashcardsCommandDto` (z `src/types.ts`)
- Model zwracany:
  - `FlashcardDto` (z `src/types.ts`)
- Zod Schema w API:
  - `z.object({ cards: z.array(z.object({ generation_id: z.string().uuid().nullable(), front_text: z.string().max(200), back_text: z.string().max(500), source: z.enum(["manual","ai-full","ai-edited"]) })).min(1) })`

## 4. Szczegóły odpowiedzi

- `201 Created`
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
      // ... więcej kart
    ]
  }
  ```
- Błędy:
  - `400 Bad Request` – walidacja payloadu nie przeszła (zwróć tablicę błędów z Zod)
  - `401 Unauthorized` – brak lub nieważny token JWT
  - `500 Internal Server Error` – nieoczekiwany błąd serwera / bazy danych

## 5. Przepływ danych

1. **Autoryzacja**: pobranie `user_id` z `context.locals.supabase.auth.getUser()`.
2. **Walidacja**: użycie Zod na body żądania.
3. **Mapowanie**: konwersja do `CreateFlashcardsCommandDto`.
4. **Serwis**: wywołanie `flashcardsService.createCards(userId, command.cards)`:
   - Grupowe wstawienie do tabeli `flashcards` metodą batch insert.
   - Zapewnić `user_id`, `generation_id`, `front_text`, `back_text`, `source`.
5. **Transformacja**: mapowanie zwróconych wierszy na `FlashcardDto`.
6. **Odpowiedź**: `new Response(JSON.stringify({ cards: [...] }), { status: 201 })`.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie**: tylko zalogowani użytkownicy (supabase JWT).
- **Autoryzacja**: row-level security w PostgreSQL, `flashcards` ma politykę `user_id = auth.uid()`.
- **Walidacja**: aby zapobiec nadmiarowi danych i XSS, ograniczenia długości i typów.
- **Ochrona przed SQL Injection**: korzystanie z Supabase client i parametrów.

## 7. Obsługa błędów

| Scenariusz                       | Kod | Działanie                                            |
| -------------------------------- | --- | ---------------------------------------------------- |
| Brak tokenu                      | 401 | Zwróć `{ error: 'Unauthorized' }`                    |
| Nieprawidłowy payload            | 400 | Zwróć `{ errors: ZodError.flatten() }`               |
| Błąd w trakcie insertu (np. RLS) | 500 | Zaloguj szczegóły, zwróć `{ error: 'Server error' }` |

## 8. Wydajność

- Batch insert zamiast wielu pojedynczych zapytań.
- Ograniczenie liczby kart w jednym żądaniu (opcjonalnie).
- Indeksy na `flashcards(user_id)` i `flashcards(generation_id)`.

## 9. Kroki implementacji

1. **Zdefiniować Zod Schema** w `src/lib/schemas/flashcards.ts`.
2. **Utworzyć serwis** `src/lib/services/flashcardsService.ts` z metodą `createCards(userId, cards)`.
3. **Dodać endpoint** `src/pages/api/flashcards.ts`:
   - `export const prerender = false`
   - `export async function POST({ request, locals }) { ... }`
4. **Inicjalizacja Supabase**: pobrać klienta z `locals.supabase`.
5. **Walidacja** ciała żądania i przemapowanie.
6. **Wywołanie serwisu** i obsługa odpowiedzi.
