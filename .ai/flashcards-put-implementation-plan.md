# API Endpoint Implementation Plan: PUT /api/flashcards/:id

## 1. Przegląd punktu końcowego

Ten punkt końcowy umożliwia użytkownikom edycję istniejącej fiszki. Jeśli edytowana jest fiszka wygenerowana przez AI, jej pole `source` musi zostać zmienione na `ai-edited`. Punkt końcowy wymaga uwierzytelnienia użytkownika.

## 2. Szczegóły żądania

- **Metoda HTTP:** `PUT`
- **Struktura URL:** `/api/flashcards/:id`
  - `:id` (parametr ścieżki): UUID fiszki do zaktualizowania.
- **Nagłówki:**
  - `Authorization: Bearer <accessToken>` (wymagane do uwierzytelnienia)
  - `Content-Type: application/json`
- **Request Body:** `application/json`
  ```json
  {
    "front_text": "string",
    "back_text": "string",
    "source": "manual" | "ai-edited"
  }
  ```
- **Parametry:**
  - **Parametry ścieżki:**
    - `id` (UUID, wymagany): Identyfikator fiszki do edycji.
  - **Parametry ciała żądania:**
    - `front_text` (string, wymagany): Nowa treść awersu fiszki (≤200 znaków).
    - `back_text` (string, wymagany): Nowa treść rewersu fiszki (≤500 znaków).
    - `source` (string, wymagany): Nowe źródło fiszki. Musi być `"manual"` lub `"ai-edited"`.

## 3. Wykorzystywane typy

Poniższe typy z `src/types.ts` będą używane:

- **`UpdateFlashcardCommandDto`**: Definiuje strukturę ciała żądania.
  ```typescript
  export type UpdateFlashcardCommandDto = Pick<FlashcardRow, "front_text" | "back_text"> & {
    source: FlashcardUpdateSource; // FlashcardUpdateSource to "manual" | "ai-edited"
  };
  ```
- **`FlashcardDto`**: Definiuje strukturę odpowiedzi dla pomyślnej aktualizacji.
  ```typescript
  export type FlashcardDto = Omit<FlashcardRow, "user_id">;
  ```
- **`FlashcardUpdateSource`**: Enum dla dozwolonych wartości pola `source` w żądaniu aktualizacji.
  ```typescript
  export type FlashcardUpdateSource = "manual" | "ai-edited";
  ```
- **`FlashcardRow`**: Typ wiersza tabeli `flashcards` z `src/db/database.types.ts` (pośrednio używany przez DTOs).

## 4. Szczegóły odpowiedzi

- **Odpowiedź sukcesu (`200 OK`):**
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
  Ciało odpowiedzi będzie obiektem typu `FlashcardDto`.
- **Odpowiedzi błędów:**
  - `400 Bad Request`: W przypadku błędów walidacji danych wejściowych.
  - `401 Unauthorized`: W przypadku braku lub nieprawidłowego tokenu uwierzytelniającego.
  - `404 Not Found`: Jeśli fiszka o podanym `id` nie istnieje lub nie należy do uwierzytelnionego użytkownika.
  - `500 Internal Server Error`: W przypadku nieoczekiwanych błędów serwera.

## 5. Przepływ danych

1.  Klient wysyła żądanie `PUT` na `/api/flashcards/:id` z tokenem uwierzytelniającym i danymi fiszki w ciele żądania.
2.  Middleware Astro weryfikuje token JWT. Jeśli token jest nieprawidłowy, zwraca `401 Unauthorized`.
3.  Handler API route w `src/pages/api/flashcards/[id].ts` (`export async function PUT(...)`) odbiera żądanie.
4.  Pobiera `id` fiszki z parametrów ścieżki (`Astro.params.id`).
5.  Pobiera `userId` uwierzytelnionego użytkownika z `Astro.locals.user.id`.
6.  Pobiera klienta Supabase z `Astro.locals.supabase`.
7.  Waliduje `id` (czy jest poprawnym UUID). Jeśli nie, zwraca `400 Bad Request`.
8.  Waliduje ciało żądania (`front_text`, `back_text`, `source`) używając schemy Zod. Walidacja obejmuje:
    - `front_text`: wymagany, string, max 200 znaków.
    - `back_text`: wymagany, string, max 500 znaków.
    - `source`: wymagany, string, musi być `"manual"` lub `"ai-edited"`.
    - W przypadku błędów walidacji, zwraca `400 Bad Request` ze szczegółami błędów.
9.  Wywołuje metodę serwisową (np. `updateFlashcard` w `FlashcardService` w `src/lib/services/flashcard.service.ts`).
10. **W `FlashcardService.updateFlashcard(flashcardId, userId, updateData)`:**
    a. Pobiera fiszkę z bazy danych Supabase używając `flashcardId` i `userId` (aby upewnić się, że użytkownik jest właścicielem).
    `sql
SELECT * FROM flashcards WHERE id = $1 AND user_id = $2;
`
    b. Jeśli fiszka nie zostanie znaleziona (lub `user_id` nie pasuje), serwis zwraca błąd (np. `null` lub rzuca custom error), co prowadzi do odpowiedzi `404 Not Found` z handlera API.
    c. Aktualizuje pola fiszki (`front_text`, `back_text`, `source`) oraz `updated_at` na `now()`.
    `sql
UPDATE flashcards
SET front_text = $1, back_text = $2, source = $3, updated_at = now()
WHERE id = $4 AND user_id = $5
RETURNING *;
`
    d. Jeśli aktualizacja w bazie danych się powiedzie, zwraca zaktualizowany obiekt fiszki.
    e. Jeśli wystąpi błąd bazy danych, serwis rzuca błąd, co prowadzi do `500 Internal Server Error`.
11. Handler API route otrzymuje zaktualizowany obiekt fiszki (lub błąd) z serwisu.
12. Jeśli operacja się powiodła, mapuje zwrócony obiekt na `FlashcardDto` (pomijając `user_id`) i zwraca `200 OK` z tym DTO.
13. W przypadku błędów z serwisu, mapuje je na odpowiednie kody statusu HTTP (`404`, `500`).

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie:** Endpoint musi być chroniony. Dostęp jest możliwy tylko dla uwierzytelnionych użytkowników. Middleware Astro i Supabase Auth (JWT) obsłużą weryfikację tokenu.
- **Autoryzacja:** Kluczowe jest sprawdzenie, czy uwierzytelniony użytkownik jest właścicielem fiszki, którą próbuje edytować. Odbywa się to poprzez filtrowanie zapytań do bazy danych po `user_id` pobranym z sesji użytkownika (`Astro.locals.user.id`). Dodatkowo, RLS (Row Level Security) w Supabase powinno być skonfigurowane dla tabeli `flashcards` tak, aby użytkownicy mogli modyfikować tylko własne fiszki.
- **Walidacja danych wejściowych:**
  - `id` (parametr ścieżki): musi być walidowany jako UUID.
  - Ciało żądania: Należy użyć Zod do walidacji typów, długości (`front_text` ≤200, `back_text` ≤500) i dozwolonych wartości (`source`). Zabezpiecza to przed niepoprawnymi danymi i potencjalnymi atakami (np. NoSQL injection, chociaż klient Supabase jest zabezpieczony przed SQL injection).
- **Ograniczenie informacji zwrotnej:** W przypadku błędu `404 Not Found` (np. fiszka nie istnieje lub użytkownik nie jest właścicielem), nie należy ujawniać, który z tych warunków nie został spełniony.
- **Ochrona przed CSRF:** Astro zazwyczaj ma wbudowane mechanizmy ochrony lub można je dodać, jeśli endpointy są wywoływane z formularzy webowych. Dla API JSON używanego przez SPA, ryzyko CSRF jest mniejsze, ale warto być świadomym.
- **Bezpieczeństwo transportu:** Użycie HTTPS dla całej komunikacji (zgodnie z `api-plan.md`).
- **CORS:** Skonfigurowane odpowiednio, aby zezwalać na żądania tylko z zaufanej domeny frontendu (zgodnie z `api-plan.md`).

## 7. Obsługa błędów

- **Błędy walidacji (400 Bad Request):**
  - Zod będzie używany do walidacji ciała żądania. W przypadku niepowodzenia walidacji, odpowiedź powinna zawierać szczegółowe informacje o błędach.
  - Przykład: Nieprawidłowa długość `front_text`, nieprawidłowa wartość `source`.
- **Brak autoryzacji (401 Unauthorized):**
  - Jeśli token JWT jest nieobecny, nieprawidłowy lub wygasł. Obsługiwane przez middleware Supabase/Astro.
- **Zasób nie znaleziony / Brak uprawnień (404 Not Found):**
  - Jeśli fiszka o podanym `id` nie istnieje w bazie danych.
  - Jeśli fiszka istnieje, ale nie należy do uwierzytelnionego użytkownika.
- **Błędy serwera (500 Internal Server Error):**
  - Problemy z połączeniem z bazą danych.
  - Nieoczekiwane błędy w logice serwisu lub handlera API.
  - Należy logować szczegóły błędów po stronie serwera dla celów diagnostycznych.
- **Struktura odpowiedzi błędu:** Zaleca się spójną strukturę JSON dla odpowiedzi błędów, np.:
  ```json
  {
    "error": {
      "message": "Szczegółowy opis błędu",
      "details": {
        /* opcjonalne dodatkowe informacje, np. błędy walidacji Zod */
      }
    }
  }
  ```

## 8. Rozważania dotyczące wydajności

- **Zapytania do bazy danych:** Operacja `UPDATE` na pojedynczym wierszu z indeksowanymi kolumnami `id` i `user_id` powinna być wydajna.
- **Walidacja:** Walidacja Zod jest szybka i nie powinna stanowić wąskiego gardła.
- **Rozmiar payloadu:** Rozmiar ciała żądania i odpowiedzi jest mały, więc nie powinien wpływać na wydajność.
- **Połączenia z bazą:** Należy upewnić się, że połączenia z bazą danych Supabase są zarządzane efektywnie (zazwyczaj obsługiwane przez klienta Supabase).

## 9. Etapy wdrożenia

1.  **Definicja schemy Zod:**
    - Stworzyć schemę Zod w pliku `src/lib/schemas/flashcard.schemas.ts` (lub podobnym) dla `UpdateFlashcardCommandDto`, uwzględniając wszystkie walidacje (długości, wartości enum).
2.  **Implementacja logiki serwisowej (`FlashcardService`):**
    - Utworzyć lub zaktualizować plik `src/lib/services/flashcard.service.ts`.
    - Dodać metodę `async updateFlashcard(supabase: SupabaseClient, flashcardId: string, userId: string, data: UpdateFlashcardCommandDto): Promise<FlashcardRow | null>`:
      - Pobiera fiszkę (SELECT) używając `flashcardId` i `userId`. Jeśli nie ma, zwraca `null`.
      - Aktualizuje fiszkę (UPDATE) z nowymi danymi i `updated_at = now()`.
      - Zwraca zaktualizowany wiersz `FlashcardRow` lub `null` w przypadku błędu zapisu (lub rzuca błąd).
3.  **Implementacja handlera API route:**
    - Utworzyć plik `src/pages/api/flashcards/[id].ts`.
    - Dodać funkcję `export async function PUT({ request, params, locals }: APIContext)`:
      - Ustawić `export const prerender = false;`.
      - Pobranie `supabase` i `user` z `locals`. Sprawdzenie czy użytkownik jest zalogowany. Jeśli nie, zwrot `401`.
      - Pobranie `id` z `params.id`. Walidacja UUID.
      - Odczytanie i parsowanie ciała żądania JSON.
      - Walidacja ciała żądania przy użyciu przygotowanej schemy Zod. W przypadku błędu, zwrot `400` z błędami.
      - Wywołanie `flashcardService.updateFlashcard` z odpowiednimi argumentami.
      - Obsługa wyniku z serwisu:
        - Jeśli `null` (lub błąd "not found"), zwrot `404`.
        - Jeśli sukces, mapowanie wyniku na `FlashcardDto` i zwrot `200 OK`.
      - Obsługa wyjątków z serwisu (np. błędy bazy danych) i zwrot `500`.
4.  **Konfiguracja RLS w Supabase:**
    - Upewnić się, że polityki RLS dla tabeli `flashcards` pozwalają użytkownikom na operacje `UPDATE` tylko na własnych rekordach (sprawdzając `auth.uid() = user_id`).
    - Przykład polityki UPDATE:
    ```sql
    CREATE POLICY "Enable update for users based on user_id"
    ON public.flashcards
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
    ```
