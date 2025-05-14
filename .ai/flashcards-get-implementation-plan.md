# API Endpoint Implementation Plan: GET /api/flashcards

## 1. Przegląd punktu końcowego

Ten punkt końcowy REST API (`GET /api/flashcards`) jest odpowiedzialny za pobieranie listy fiszek należących do uwierzytelnionego użytkownika. Umożliwia paginację, sortowanie oraz filtrowanie wyników na podstawie źródła fiszki.

## 2. Szczegóły żądania

- **Metoda HTTP:** `GET`
- **Struktura URL:** `/api/flashcards`
- **Parametry zapytania (Query Parameters):**
  - `page` (opcjonalny):
    - Typ: `integer`
    - Domyślnie: `1`
    - Opis: Numer strony wyników. Minimalna wartość: `1`.
  - `pageSize` (opcjonalny):
    - Typ: `integer`
    - Domyślnie: `20`
    - Opis: Liczba fiszek na stronie. Minimalna wartość: `1`, Maksymalna sugerowana: `100`.
  - `sortBy` (opcjonalny):
    - Typ: `string`
    - Domyślnie: `created_at`
    - Dozwolone wartości: `created_at`
    - Opis: Pole, według którego sortowane są wyniki.
  - `sortOrder` (opcjonalny):
    - Typ: `string`
    - Domyślnie: `desc`
    - Dozwolone wartości: `asc`, `desc`
    - Opis: Kierunek sortowania.
  - `source` (opcjonalny):
    - Typ: `string`
    - Dozwolone wartości: `ai-full`, `ai-edited`, `manual`
    - Opis: Filtruje fiszki według ich źródła pochodzenia.
- **Request Body:** Brak (dla żądania GET).

## 3. Wykorzystywane typy

Poniższe typy DTO (Data Transfer Objects) zdefiniowane w `src/types.ts` będą używane:

- `FlashcardDto`: Reprezentuje pojedynczą fiszkę w odpowiedzi.
  ```typescript
  export type FlashcardDto = Omit<FlashcardRow, "user_id">;
  ```
- `PaginationDto`: Zawiera informacje o paginacji.
  ```typescript
  export interface PaginationDto {
    page: number;
    page_size: number;
    total: number;
  }
  ```
  _Uwaga: API przyjmuje `pageSize`, które będzie mapowane na `page_size` używane w `PaginationDto` i logice serwisowej._
- `ListFlashcardsResponseDto`: Główny obiekt odpowiedzi.
  ```typescript
  export interface ListFlashcardsResponseDto {
    data: FlashcardDto[];
    pagination: PaginationDto;
  }
  ```
  Dodatkowo, schemat Zod zostanie zdefiniowany w pliku API route do walidacji parametrów zapytania.

## 4. Szczegóły odpowiedzi

- **Odpowiedź sukcesu (`200 OK`):**

  ```json
  {
    "data": [
      {
        "id": "uuid",
        "generation_id": "uuid | null",
        "front_text": "string",
        "back_text": "string",
        "source": "string", // "ai-full", "ai-edited", or "manual"
        "created_at": "ISO8601",
        "updated_at": "ISO8601"
      }
      // ... inne fiszki
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20, // Zgodnie ze specyfikacją API, nazwa `pageSize`
      "total": 100
    }
  }
  ```

  _Uwaga: Chociaż wewnętrzny `PaginationDto` używa `page_size`, odpowiedź API będzie używać `pageSize` dla spójności ze specyfikacją żądania._

- **Odpowiedzi błędów:**
  - `400 Bad Request`: Nieprawidłowe parametry zapytania. Odpowiedź będzie zawierać szczegóły błędu walidacji.
  - `401 Unauthorized`: Użytkownik nie jest uwierzytelniony.
  - `500 Internal Server Error`: Wewnętrzny błąd serwera.

## 5. Przepływ danych

1.  Klient wysyła żądanie `GET` na `/api/flashcards` z opcjonalnymi parametrami zapytania.
2.  Middleware Astro weryfikuje uwierzytelnienie użytkownika. Jeśli użytkownik nie jest uwierzytelniony, zwraca `401 Unauthorized`.
3.  Handler API route w `src/pages/api/flashcards/index.ts` (lub dedykowanym pliku dla `GET`):
    a. Pobiera `supabase` klienta i `user` obiekt z `Astro.locals`.
    b. Definiuje schemat Zod do walidacji parametrów zapytania (`page`, `pageSize`, `sortBy`, `sortOrder`, `source`).
    c. Waliduje parametry zapytania. Jeśli walidacja nie powiodła się, zwraca `400 Bad Request` z odpowiednim komunikatem.
    d. Mapuje parametr `pageSize` z zapytania na `page_size` (jeśli serwis tego wymaga, lub serwis przyjmuje `pageSize` i mapuje wewnętrznie). Ustala domyślne wartości dla brakujących parametrów.
    e. Wywołuje metodę serwisu `flashcardService.listUserFlashcards()` przekazując `userId` (z `Astro.locals.user.id`) oraz zwalidowane i przetworzone parametry.
4.  Serwis `FlashcardService` (w `src/lib/services/flashcardService.ts`):
    a. Przyjmuje `userId` i opcje paginacji/sortowania/filtrowania.
    b. Konstruuje zapytanie do Supabase, aby pobrać fiszki z tabeli `flashcards`.
    i. Filtruje po `user_id`.
    ii. Jeśli podano `source`, filtruje po kolumnie `source`.
    iii. Stosuje sortowanie na podstawie `sortBy` (obecnie `created_at`) i `sortOrder`.
    iv. Stosuje paginację (oblicza `offset` i `limit` na podstawie `page` i `page_size`).
    v. Pobiera również całkowitą liczbę pasujących rekordów (`count: 'exact'`) dla celów paginacji.
    c. Mapuje wyniki z bazy danych na tablicę `FlashcardDto`.
    d. Tworzy obiekt `PaginationDto` (używając `page_size` wewnętrznie).
    e. Zwraca obiekt `{ data: FlashcardDto[], pagination: PaginationDto }`.
5.  Handler API route:
    a. Otrzymuje dane z serwisu.
    b. Konstruuje obiekt `ListFlashcardsResponseDto`, mapując `page_size` z `PaginationDto` z powrotem na `pageSize` w finalnej odpowiedzi, aby była zgodna ze specyfikacją API.
    c. Wysyła odpowiedź `200 OK` z danymi JSON.
6.  W przypadku błędów w serwisie (np. błąd bazy danych), serwis zgłasza błąd. Handler API route przechwytuje go i zwraca `500 Internal Server Error`, logując szczegóły błędu.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie:** Dostęp do punktu końcowego musi być chroniony. Middleware Astro powinno zapewnić, że tylko uwierzytelnieni użytkownicy mogą uzyskać dostęp. `Astro.locals.user` będzie źródłem tożsamości użytkownika.
- **Autoryzacja:** Użytkownicy mogą pobierać tylko własne fiszki. Filtr `user_id = Astro.locals.user.id` musi być bezwzględnie stosowany w zapytaniu do bazy danych. Dodatkowo, polityki RLS (Row Level Security) w Supabase powinny być skonfigurowane dla tabeli `flashcards`, aby wymusić tę regułę na poziomie bazy danych.
- **Walidacja danych wejściowych:** Wszystkie parametry zapytania (`page`, `pageSize`, `sortBy`, `sortOrder`, `source`) muszą być rygorystycznie walidowane przy użyciu Zod, aby zapobiec błędom przetwarzania, potencjalnym atakom (np. nadmierny `pageSize` mogący obciążyć serwer) oraz zapewnić integralność danych. Należy ustawić rozsądne limity (np. maksymalny `pageSize`).
- **Ochrona przed enumeracją:** Chociaż `id` fiszki jest UUID, nie ma bezpośredniego ryzyka enumeracji przez ten endpoint, ponieważ listuje on zasoby użytkownika.
- **Bezpieczeństwo transportu:** Użycie HTTPS jest standardem i powinno być zapewnione przez konfigurację hostingu.
- **Minimalne ujawnienie danych:** Odpowiedź powinna zawierać tylko niezbędne pola zdefiniowane w `FlashcardDto`, co jest już zapewnione przez pominięcie `user_id`.

## 7. Obsługa błędów

- **`400 Bad Request`**:
  - Przyczyna: Nieprawidłowe parametry zapytania (np. `page` nie jest liczbą, `pageSize` poza zakresem, nieprawidłowa wartość dla `sortBy`, `sortOrder` lub `source`).
  - Obsługa: Handler API route użyje Zod do walidacji. W przypadku błędu, zwróci odpowiedź JSON zawierającą szczegóły błędów walidacji.
- **`401 Unauthorized`**:
  - Przyczyna: Użytkownik nie jest uwierzytelniony lub sesja wygasła.
  - Obsługa: Middleware Astro powinno automatycznie obsłużyć ten przypadek, zwracając odpowiedni status.
- **`500 Internal Server Error`**:
  - Przyczyna: Błędy po stronie serwera, takie jak problemy z połączeniem z bazą danych, nieoczekiwane wyjątki w logice serwisu lub handlera.
  - Obsługa: Handler API route powinien zawierać blok `try...catch` do przechwytywania wyjątków z warstwy serwisowej. Szczegółowy błąd powinien być logowany po stronie serwera, a klient powinien otrzymać generyczną wiadomość o błędzie.

## 8. Rozważania dotyczące wydajności

- **Indeksowanie bazy danych:**
  - Kolumna `user_id` w tabeli `flashcards` musi być zaindeksowana, ponieważ jest kluczowym filtrem.
  - Kolumna `created_at` (lub inne pola używane do `sortBy`) powinna być zaindeksowana.
  - Kolumna `source` powinna być zaindeksowana, jeśli filtrowanie po niej jest częste.
  - Rozważ złożone indeksy, jeśli kombinacje filtrów i sortowania są częste (np. `(user_id, created_at)`).
- **Paginacja:** Paginacja jest kluczowa dla wydajności przy dużych zbiorach danych. Zapytanie Supabase z `range()` i `count: 'exact'` jest odpowiednim podejściem.
- **Rozmiar odpowiedzi:** Ograniczenie `pageSize` do rozsądnej wartości maksymalnej (np. 100) zapobiega generowaniu zbyt dużych odpowiedzi.
- **Optymalizacja zapytań:** Upewnij się, że zapytania Supabase są zoptymalizowane i pobierają tylko niezbędne kolumny (`select('id, generation_id, ...')`).
- **Caching:** Na tym etapie nie jest wymagany, ale w przyszłości można rozważyć cache'owanie na poziomie API Gateway lub CDN, jeśli endpoint będzie intensywnie używany z powtarzającymi się zapytaniami (choć dane użytkownika są dynamiczne, więc ostrożnie).

## 9. Etapy wdrożenia

1.  **Definicja schematu Zod:**
    - W pliku handlera API (`src/pages/api/flashcards/index.ts` lub podobnym): Zdefiniuj schemat Zod do walidacji parametrów `page`, `pageSize`, `sortBy`, `sortOrder`, `source`. Uwzględnij domyślne wartości i transformacje (np. `coerce.number()` dla `page` i `pageSize`).
2.  **Utworzenie serwisu `FlashcardService`:**
    - Utwórz plik `src/lib/services/flashcardService.ts`.
    - Zdefiniuj interfejs dla opcji przekazywanych do metody listującej (np. `ListFlashcardsOptions`).
    - Zaimplementuj metodę `listUserFlashcards(supabase: SupabaseClient, userId: string, options: ListFlashcardsOptions): Promise<ListFlashcardsResponseDto>`.
      - Metoda ta będzie konstruować i wykonywać zapytanie do Supabase używając przekazanego klienta `supabase`.
      - Zastosuje filtrowanie po `userId` i opcjonalnie `source`.
      - Zastosuje sortowanie (`created_at` i `sortOrder`).
      - Zaimplementuje logikę paginacji (używając `options.page` i `options.pageSize` do obliczenia `offset` i `limit`).
      - Pobierze całkowitą liczbę rekordów dla `pagination.total`.
      - Zmapuje wyniki na `FlashcardDto[]`.
      - Zwróci obiekt zgodny z `ListFlashcardsResponseDto` (uwzględniając, że `PaginationDto` używa `page_size`).
3.  **Implementacja handlera API route (Astro):**
    - Utwórz lub zaktualizuj plik `src/pages/api/flashcards/index.ts` (lub `src/pages/api/flashcards/GET.ts` jeśli używasz konwencji plików per metoda).
    - Dodaj `export const prerender = false;`.
    - Zaimplementuj funkcję obsługi `GET` (np. `export async function GET({ request, locals }: APIContext)`).
    - Pobierz `supabase` i `user` z `locals`. Jeśli `!user`, zwróć `401`.
    - Przeanalizuj parametry zapytania z `request.url`.
    - Zwaliduj parametry używając zdefiniowanego schematu Zod. W przypadku błędu, zwróć `400` z informacjami o błędzie.
    - Wywołaj `flashcardService.listUserFlashcards`, przekazując `supabase`, `user.id` i zwalidowane/przetworzone parametry.
    - W bloku `try...catch` obsłuż potencjalne błędy z serwisu, logując je i zwracając `500`.
    - Jeśli sukces, skonstruuj odpowiedź JSON (mapując `page_size` z `PaginationDto` serwisu na `pageSize` w finalnej odpowiedzi) i zwróć `200 OK`.
