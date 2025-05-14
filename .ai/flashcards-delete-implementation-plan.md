# API Endpoint Implementation Plan: DELETE /api/flashcards/:id

## 1. Przegląd punktu końcowego

Ten punkt końcowy jest odpowiedzialny za usuwanie pojedynczej fiszki (flashcard) na podstawie jej unikalnego identyfikatora (`id`). Operacja jest dostępna tylko dla uwierzytelnionego użytkownika, który jest właścicielem danej fiszki. Pomyślne usunięcie skutkuje odpowiedzią bez zawartości.

## 2. Szczegóły żądania

- **Metoda HTTP:** `DELETE`
- **Struktura URL:** `/api/flashcards/:id`
- **Parametry:**
  - **Ścieżki (Path Parameters):**
    - `id` (UUID): Wymagany. Unikalny identyfikator fiszki do usunięcia.
  - **Zapytania (Query Parameters):** Brak.
- **Request Body:** Brak.

## 3. Wykorzystywane typy

- `string` dla `id` (po walidacji jako UUID)
- `FlashcardRow` (z `src/types.ts`): Używany wewnętrznie przez serwis do interakcji z bazą danych.
- `AstroGlobal` (z `astro`): Dla dostępu do `context.locals.supabase`.
- `APIContext` (z `astro`): Dla typowania kontekstu endpointu API.

## 4. Szczegóły odpowiedzi

- **Sukces:**
  - Kod statusu: `204 No Content`
  - Treść odpowiedzi: Brak.
- **Błędy:**
  - Kod statusu: `400 Bad Request` (np. niepoprawny format `id`)
    ```json
    {
      "error": "Invalid input",
      "details": [
        /* Komunikaty błędów z Zod */
      ]
    }
    ```
  - Kod statusu: `401 Unauthorized` (np. brak lub nieprawidłowy token JWT)
    ```json
    {
      "message": "Unauthorized"
    }
    ```
  - Kod statusu: `404 Not Found` (np. fiszka o podanym `id` nie istnieje lub nie należy do użytkownika)
    ```json
    {
      "error": "Flashcard not found"
    }
    ```
  - Kod statusu: `500 Internal Server Error` (np. błąd bazy danych)
    ```json
    {
      "error": "Internal server error"
    }
    ```

## 5. Przepływ danych

1.  Klient wysyła żądanie `DELETE` na adres `/api/flashcards/:id` z tokenem JWT w nagłówku `Authorization`.
2.  Middleware Astro przechwytuje żądanie i weryfikuje token JWT za pomocą `context.locals.supabase.auth.getUser()`.
    - Jeśli token jest nieprawidłowy lub brak go, zwraca `401 Unauthorized`.
3.  Handler API Astro (np. w `src/pages/api/flashcards/[id].ts`) otrzymuje żądanie.
4.  Walidacja parametru ścieżki `id` przy użyciu Zod (musi być poprawnym UUID).
    - Jeśli walidacja nie powiodła się, zwraca `400 Bad Request`.
5.  Handler wywołuje metodę w `FlashcardService` (np. `deleteFlashcardById(flashcardId: string, userId: string)`), przekazując `id` fiszki oraz `userId` zalogowanego użytkownika (uzyskane z sesji Supabase).
6.  `FlashcardService`:
    a. Próbuje usunąć fiszkę z bazy danych Supabase, używając `flashcardId` i `userId`.
    b. Zapytanie do bazy danych powinno zawierać warunek `WHERE id = :flashcardId AND user_id = :userId`. Alternatywnie, polegać na polityce RLS Supabase, która zapewnia, że użytkownik może usuwać tylko własne fiszki.
    c. Jeśli operacja w bazie danych (np. `supabase.from('flashcards').delete().match({ id: flashcardId, user_id: userId })`) nie znajdzie pasującego rekordu lub usunie 0 wierszy, serwis zwraca informację o niepowodzeniu (traktowane jako "not found").
    d. Jeśli wystąpi błąd bazy danych, serwis zwraca odpowiedni błąd.
7.  Handler API Astro na podstawie wyniku z serwisu:
    - Jeśli usunięcie powiodło się, zwraca `204 No Content`.
    - Jeśli serwis zasygnalizował, że fiszka nie została znaleziona (lub nie należy do użytkownika), zwraca `404 Not Found`.
    - W przypadku innych błędów serwisu (np. błąd bazy danych), zwraca `500 Internal Server Error`.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie:** Każde żądanie musi być uwierzytelnione za pomocą ważnego tokenu JWT Supabase, przekazanego w nagłówku `Authorization: Bearer <token>`. Middleware Astro będzie odpowiedzialne za weryfikację.
- **Autoryzacja:** Kluczowe jest zapewnienie, że użytkownik może usunąć tylko własne fiszki.
  - **Warstwa serwisowa:** `FlashcardService` musi jawnie używać `userId` zalogowanego użytkownika w zapytaniu `DELETE` do bazy danych.
  - **Warstwa bazy danych (RLS):** Należy skonfigurować lub potwierdzić istnienie polityki Row Level Security (RLS) w Supabase dla tabeli `flashcards`, która zezwala na operację `DELETE` tylko wtedy, gdy `auth.uid() = user_id`. Jest to podstawowy mechanizm zabezpieczający.
- **Walidacja danych wejściowych:** Parametr `id` musi być walidowany jako UUID, aby zapobiec błędom bazy danych lub potencjalnym atakom (np. SQL injection, chociaż Supabase SDK w dużym stopniu przed tym chroni). Użycie Zod do walidacji.
- **Ograniczenie szybkości (Rate Limiting):** Chociaż nie jest to jawnie wymagane w specyfikacji dla tego konkretnego endpointu, ogólne mechanizmy rate limiting na API mogą być rozważone w celu ochrony przed nadużyciami.
- **CORS:** Skonfigurowane zgodnie z ogólnymi zasadami projektu ("CORS restricted to front-end origin").
- **HTTPS:** Zgodnie z ogólnymi zasadami ("HTTPS everywhere").

## 7. Obsługa błędów

- **Walidacja `id`:** Jeśli `id` nie jest poprawnym UUID, handler zwróci `400 Bad Request` z odpowiednim komunikatem.
- **Brak uwierzytelnienia:** Middleware zwróci `401 Unauthorized`.
- **Fiszka nie istnieje lub brak uprawnień:** Jeśli `FlashcardService` nie znajdzie fiszki o podanym `id` należącej do użytkownika, handler zwróci `404 Not Found`. Ważne jest, aby nie rozróżniać między "nie istnieje" a "brak uprawnień", aby uniknąć wycieku informacji o istnieniu zasobów.
- **Błędy serwera/bazy danych:** W przypadku problemów z bazą danych lub innych nieoczekiwanych błędów serwera, handler zwróci `500 Internal Server Error`. Należy logować szczegóły takich błędów po stronie serwera.

## 8. Rozważania dotyczące wydajności

- Operacja usunięcia pojedynczego rekordu po kluczu głównym (`id`) i z dodatkowym warunkiem na `user_id` (który powinien być indeksowany lub być częścią klucza złożonego/RLS) jest zazwyczaj bardzo wydajna w PostgreSQL.
- Głównym czynnikiem wpływającym na wydajność będzie czas odpowiedzi od bazy danych Supabase.
- Upewnić się, że kolumna `user_id` w tabeli `flashcards` jest indeksowana, jeśli RLS nie korzysta z niej w sposób, który automatycznie optymalizuje zapytania. Klucz główny `id` jest domyślnie indeksowany.

## 9. Etapy wdrożenia

1.  **Definicja trasy API Astro:**
    - Utworzyć plik `src/pages/api/flashcards/[id].ts`.
    - Zaimplementować funkcję `DELETE` w tym pliku.
    - `export const prerender = false;`
2.  **Middleware (jeśli potrzebne dodatkowe ponad globalne):**
    - Upewnić się, że globalne middleware Astro obsługuje weryfikację sesji Supabase i udostępnia `context.locals.supabase` oraz `context.locals.user`.
3.  **Walidacja `id`:**
    - W handlerze `DELETE` użyć Zod do zwalidowania, czy `context.params.id` jest poprawnym UUID.
4.  **Implementacja `FlashcardService`:**

    - Utworzyć lub zaktualizować plik `src/lib/services/flashcardService.ts`.
    - Dodać metodę, np. `deleteFlashcard(id: string, userId: string, supabase: SupabaseClient): Promise<{ success: boolean, error?: 'not_found' | 'database_error' }>`.
    - Metoda powinna wykonać zapytanie `delete` do tabeli `flashcards` w Supabase, używając `id` i `userId`.

    ```typescript
    // Przykład w FlashcardService
    const { error, count } = await supabase.from("flashcards").delete().match({ id: id, user_id: userId });

    if (error) {
      // Log error
      return { success: false, error: "database_error" };
    }
    if (count === 0) {
      return { success: false, error: "not_found" };
    }
    return { success: true };
    ```

5.  **Integracja Handlera API z Serwisem:**
    - W handlerze `DELETE` (`src/pages/api/flashcards/[id].ts`):
      - Uzyskać `userId` z `context.locals.user.id` (po weryfikacji przez middleware).
      - Uzyskać `supabase` z `context.locals.supabase`.
      - Wywołać metodę `flashcardService.deleteFlashcard(...)`.
      - Zwrócić odpowiednią odpowiedź HTTP (`204`, `404`, `500`) na podstawie wyniku z serwisu.
