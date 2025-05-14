# API Endpoint Implementation Plan: GET /api/flashcards/:id

## 1. Przegląd punktu końcowego

Ten punkt końcowy służy do pobierania pojedynczej fiszki na podstawie jej unikalnego identyfikatora (UUID). Zapewnia dostęp do szczegółowych informacji o fiszce, z uwzględnieniem uprawnień użytkownika.

## 2. Szczegóły żądania

- **Metoda HTTP:** `GET`
- **Struktura URL:** `/api/flashcards/:id`
- **Parametry:**
  - **Wymagane:**
    - `id` (Path Parameter, UUID): Unikalny identyfikator fiszki. Musi być w formacie UUID.
  - **Opcjonalne:** Brak
- **Request Body:** Brak (dla żądania GET).

## 3. Szczegóły odpowiedzi

- **Odpowiedź sukcesu (`200 OK`):**
  - **Content-Type:** `application/json`
  - **Body:** Obiekt JSON reprezentujący fiszkę, zgodny z typem `GetFlashcardResponseDto` (alias dla `FlashcardDto` z `src/types.ts`).
    ```json
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "generation_id": "abcdef12-3456-7890-abcd-ef1234567890", // Może być null
      "front_text": "What is Astro?",
      "back_text": "A web framework for building fast, content-focused websites.",
      "source": "manual", // 'manual', 'ai-full', or 'ai-edited'
      "created_at": "2023-10-26T10:00:00Z",
      "updated_at": "2023-10-26T10:05:00Z"
    }
    ```
- **Odpowiedzi błędów:**
  - `400 Bad Request`: Jeśli parametr `id` nie jest poprawnym UUID.
    ```json
    {
      "message": "Validation failed",
      "errors": { "id": ["Invalid flashcard ID format."] }
    }
    ```
  - `401 Unauthorized`: Jeśli użytkownik nie jest uwierzytelniony.
    ```json
    {
      "message": "Unauthorized"
    }
    ```
  - `404 Not Found`: Jeśli fiszka o podanym `id` nie istnieje lub użytkownik nie ma do niej dostępu.
    ```json
    {
      "message": "Flashcard not found"
    }
    ```
  - `500 Internal Server Error`: W przypadku nieoczekiwanych błędów serwera.
    ```json
    {
      "message": "Internal server error"
    }
    ```

## 4. Przepływ danych

1.  Klient wysyła żądanie `GET` na `/api/flashcards/:id`.
2.  Middleware Astro weryfikuje uwierzytelnienie użytkownika (np. poprzez Supabase Auth). Jeśli użytkownik nie jest uwierzytelniony, zwracany jest błąd `401`. Informacje o użytkowniku (`user`) i klient Supabase (`supabase`) są dostępne w `context.locals`.
3.  Handler API Route w `src/pages/api/flashcards/[id].ts` jest wywoływany.
4.  Parametr ścieżki `id` jest walidowany przy użyciu Zod (musi być UUID). Jeśli walidacja nie powiodła się, zwracany jest błąd `400`.
5.  Handler wywołuje metodę (np. `getFlashcardById(flashcardId, userId)`) w `FlashcardService` (znajdującym się w `src/lib/services/flashcardService.ts`), przekazując `flashcardId` oraz `userId` zalogowanego użytkownika (z `context.locals.user.id`).
6.  `FlashcardService` używa klienta Supabase (`context.locals.supabase`) do wykonania zapytania do tabeli `flashcards`.
    - Zapytanie SQL: `SELECT id, generation_id, front_text, back_text, source, created_at, updated_at FROM flashcards WHERE id = $1 AND user_id = $2;`
    - Parametry: `flashcardId`, `userId`.
7.  Jeśli zapytanie nie zwróci żadnych wyników (fiszka nie istnieje lub nie należy do użytkownika), serwis zwraca `null`. Handler API zwraca wtedy `404 Not Found`.
8.  Jeśli fiszka zostanie znaleziona, serwis mapuje wynik na `FlashcardDto` i zwraca go do handlera API.
9.  Handler API serializuje DTO do JSON i wysyła odpowiedź `200 OK`.
10. W przypadku błędów bazy danych lub innych nieoczekiwanych problemów w serwisie, zgłaszany jest błąd, który jest przechwytywany przez handler API, a następnie zwracany jest `500 Internal Server Error`.

## 5. Względy bezpieczeństwa

- **Uwierzytelnianie:** Dostęp do endpointu musi być chroniony. Użytkownik musi być zalogowany. Odpowiednie middleware Astro (korzystające z Supabase Auth) powinno to zapewnić, udostępniając `context.locals.user`.
- **Autoryzacja:** Kluczowe jest, aby użytkownik mógł pobrać tylko własne fiszki. Zapytanie do bazy danych musi zawierać warunek `user_id = :current_user_id`. Zapobiegnie to podatności IDOR. `user_id` nie jest zwracany w odpowiedzi API.
- **Walidacja danych wejściowych:** Parametr `id` musi być walidowany jako UUID, aby zapobiec błędom zapytań i potencjalnym atakom. Zod będzie używany do tej walidacji.
- **Minimalizacja danych:** Odpowiedź API (`FlashcardDto`) nie zawiera pola `user_id`, zgodnie z zasadą minimalizacji danych.

## 6. Obsługa błędów

- **Walidacja `id`:** Błąd `400 Bad Request` z komunikatem o nieprawidłowym formacie UUID.
- **Brak uwierzytelnienia:** Błąd `401 Unauthorized` (obsługiwany przez middleware).
- **Fiszka nieznaleziona / Brak uprawnień:** Błąd `404 Not Found`. Jest to celowe, aby nie ujawniać istnienia zasobów, do których użytkownik nie ma dostępu.
- **Błędy serwera/bazy danych:** Błąd `500 Internal Server Error` z ogólnym komunikatem. Szczegółowe błędy powinny być logowane po stronie serwera.
- Wszystkie odpowiedzi błędów powinny mieć `Content-Type: application/json` i zawierać obiekt JSON z polem `message`.

## 7. Rozważania dotyczące wydajności

- Zapytanie do bazy danych jest proste i indeksowane (Primary Key na `id` oraz potencjalny indeks na `user_id`). Powinno być wydajne.
- Niewielki rozmiar odpowiedzi JSON.
- Należy upewnić się, że klient Supabase jest poprawnie inicjowany i zarządzany w kontekście Astro.
- Należy ustawić `export const prerender = false;` dla tego dynamicznego endpointu API.

## 8. Etapy wdrożenia

1.  **Utworzenie pliku API Route:**
    - Stwórz plik `src/pages/api/flashcards/[id].ts`.
    - Dodaj `export const prerender = false;`.
2.  **Zdefiniowanie schematu walidacji Zod:**
    - W pliku `[id].ts` zdefiniuj schemat Zod do walidacji parametru ścieżki `id` (musi być UUID).
3.  **Implementacja `FlashcardService` (jeśli nie istnieje):**
    - Stwórz (lub zaktualizuj) plik `src/lib/services/flashcardService.ts`.
    - Dodaj metodę `async getFlashcardById(flashcardId: string, userId: string, supabase: SupabaseClient): Promise<FlashcardDto | null>`.
    - Wewnątrz metody, wykonaj zapytanie do Supabase, aby pobrać fiszkę, filtrując po `id` i `user_id`.
    - Upewnij się, że wybierasz tylko kolumny potrzebne dla `FlashcardDto`.
    - Obsłuż przypadki, gdy fiszka nie zostanie znaleziona (zwróć `null`) lub wystąpi błąd bazy danych (zgłoś błąd lub zwróć `null` i zaloguj).
4.  **Implementacja handlera `GET` w API Route:**
    - W `src/pages/api/flashcards/[id].ts`, zaimplementuj funkcję `GET: APIRoute`.
    - Pobierz `user` i `supabase` z `context.locals`.
    - Sprawdź, czy `user` istnieje; jeśli nie, zwróć `401`.
    - Waliduj parametr `params.id` przy użyciu schematu Zod. Jeśli jest niepoprawny, zwróć `400`.
    - Utwórz instancję `FlashcardService`.
    - Wywołaj `flashcardService.getFlashcardById()` z `id` fiszki i `user.id`.
    - Jeśli wynik to `null`, zwróć `404 Not Found`.
    - Jeśli fiszka zostanie zwrócona, odpowiedz statusem `200 OK` i obiektem fiszki w formacie JSON (`GetFlashcardResponseDto`).
    - Dodaj blok `try...catch` do obsługi nieoczekiwanych błędów z serwisu i zwróć `500 Internal Server Error`.
5.  **Aktualizacja typów (jeśli konieczne):**
    - Upewnij się, że `GetFlashcardResponseDto` i `FlashcardDto` w `src/types.ts` są zgodne z oczekiwaną odpowiedzią i strukturą tabeli `flashcards` (bez `user_id`).
