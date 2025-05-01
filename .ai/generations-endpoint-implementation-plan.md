# API Endpoint Implementation Plan: POST /api/generations

## 1. Przegląd punktu końcowego

Punkt końcowy umożliwia uwierzytelnionym użytkownikom przesłanie surowego tekstu (1 000–10 000 znaków) w celu wygenerowania fiszek z użyciem AI. Odpowiedź zawiera metadane generacji oraz wygenerowane propozycje front/back tekstu.

## 2. Szczegóły żądania

- Metoda HTTP: `POST`
- URL: `/api/generations`
- Nagłówki:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- Body (JSON):
  ```json
  {
    "text": "string" // 1 000–10 000 znaków
  }
  ```
- Parametry:
  - Wymagane:
    - `text` (string) – surowy tekst do analizy
  - Opcjonalne: brak

## 3. Szczegóły odpowiedzi

- **201 Created** – przy poprawnej generacji:
  ```json
  {
    "id": "uuid",
    "input_length": number,
    "generated_count": number,
    "generation_duration": number,  // w milisekundach
    "candidates": [
      { "front_text": "string", "back_text": "string" },
      ...
    ]
  }
  ```
- **400 Bad Request** – nieprawidłowe dane wejściowe (długość, format)
- **401 Unauthorized** – brak lub nieważny token
- **429 Too Many Requests** – przekroczono limit żądań
- **500 Internal Server Error** – błąd serwera lub usługi AI

## 4. Przepływ danych

1. **Autoryzacja** – weryfikacja sesji użytkownika z `context.locals`
2. **Walidacja** – schema Zod sprawdzająca długość `text`
3. **Przygotowanie**:
   - Obliczenie `input_length` i `input_hash` (SHA-256)
   - Wygenerowanie `generationId`
4. **Rejestracja wstępna** – INSERT do tabeli `generations` z podstawowymi danymi (status pending domyślny)
5. **Wywołanie AI** – przekazanie `text` do serwisu OpenRouter/Astro (`ai.service.ts`) i pomiar czasu
   - Ustawić limit timeout (np. 60s) i obsłużyć przekroczenie limitu
6. **Przetworzenie odpowiedzi** – dopasowanie do `GenerationCandidateDto`
7. **Aktualizacja generacji** – update `generated_count` i `generation_duration` w tabeli `generations`
8. **Zwrot odpowiedzi** – mapowanie do `CreateGenerationResponseDto`

## 5. Względy bezpieczeństwa

- **Autoryzacja**: tylko uwierzytelnieni użytkownicy
- **Walidacja i sanitacja**: Zod + length checks
- **Parametryzowane zapytania**: Supabase client zapewnia bezpieczeństwo SQL
- **Ochrona danych**: przechowywanie hash zamiast surowego tekstu

## 6. Obsługa błędów

| Kod | Sytuacja                                   | Działanie                                        |
| --- | ------------------------------------------ | ------------------------------------------------ |
| 400 | Walidacja danych (length <1000 lub >10000) | Zwrócenie szczegółów błędu z informacją o polach |
| 401 | Brak lub nieważny token                    | `return new Response(null, { status: 401 })`     |
| 429 | Przekroczono limit żądań                   | `return new Response(null, { status: 429 })`     |
| 500 | Błąd AI lub baza danych                    | Log w `generation_error_logs` + zwrócenie 500    |

**Logowanie błędów** w tabeli `generation_error_logs`:

- Pola: `user_id`, `generation_id`, `model`, `source_text_hash`, `source_text_length`, `error_code`, `error_message`.
- Wywoływane w `catch` blokach serwisu.

## 7. Rozważania dotyczące wydajności

- **Transakcje**: grupowanie INSERT/UPDATE w jednej transakcji
- **Batch insert**: wstawianie flashcards jednym zapytaniem
- **Indeksy**: indeks na `user_id` i `generation_id`
- **Debounce/Cache**: unikanie duplikatów przez `input_hash`
- **Timeout**: limit czasu dla wywołania usługi AI (np. 60s) i fallback/error handling
- **Asynchroniczność**: unikać blokowania event loop

## 8. Kroki implementacji

1. Utworzyć Zod schema dla `CreateGenerationCommand` w `src/lib/schemas/generation.schema.ts`.
2. Dodać typy DTO (jeśli brak) w `src/types.ts` (`CreateGenerationResponseDto`, `GenerationCandidateDto`).
3. Zaimplementować `GenerationService` w `src/lib/services/generation.service.ts`:
   - Metoda `generateFlashcards(userId: string, text: string): Promise<CreateGenerationResponseDto>`
   - Obsługa logiki DB i AI
4. Dodać serwis AI (`ai.service.ts`) do komunikacji z OpenRouter.
5. Stworzyć trasę API w `src/pages/api/generations.ts`:
   - `export const POST` handler korzystający z `context.locals.supabase` i `GenerationService`
   - Middleware autoryzujące i rate limiting
6. Zaimplementować logowanie błędów w catch blokach do `generation_error_logs`.
7. Zaktualizować dokumentację API i dodać przykłady użycia.
