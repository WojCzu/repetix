# Plan implementacji widoku Fiszki (`/flashcards`)

## 1. Przegląd

Widok `/flashcards` umożliwia zalogowanym użytkownikom przeglądanie wszystkich swoich zapisanych fiszek, zarządzanie nimi poprzez operacje tworzenia, edycji i usuwania (CRUD), a także efektywne nawigowanie po zbiorze fiszek dzięki paginacji. Celem jest zapewnienie intuicyjnego interfejsu do zarządzania osobistą bazą fiszek, wspierając proces nauki.

## 2. Routing widoku

Widok będzie dostępny pod ścieżką `/flashcards`. Dostęp do tego widoku powinien być chroniony i wymagać zalogowania użytkownika. Niezalogowani użytkownicy próbujący uzyskać dostęp do tej ścieżki zostaną przekierowani na stronę logowania.

## 3. Struktura komponentów

Hierarchia głównych komponentów dla widoku `/flashcards` przedstawia się następująco:

```
FlashcardsPage (strona Astro, np. `src/pages/flashcards.astro` lub komponent React)
  ├── Button (Shadcn/ui) - "Dodaj nową fiszkę"
  │     └── (Otwiera FlashcardFormModal w trybie 'dodaj')
  ├── PaginatedGrid (komponent React)
  │   └── FlashcardCard (komponent React) - powtarzany dla każdej fiszki
  │       ├── <FrontText>
  │       ├── <BackText>
  │       ├── Badge (Shadcn/ui) - wyświetla `source` fiszki
  │       ├── <CreatedAtDate>
  │       ├── Button (Shadcn/ui) - "Edytuj"
  │       │     └── (Otwiera FlashcardFormModal w trybie 'edytuj' z danymi fiszki)
  │       └── Button (Shadcn/ui) - "Usuń"
  │             └── (Otwiera ConfirmationModal)
  ├── FlashcardFormModal (komponent React, używa Shadcn/ui Dialog) - dla dodawania/edycji
  │   ├── FormInput (Shadcn/ui Input) - dla `front_text`
  │   └── TextareaWithCounter (Shadcn/ui Textarea + logika licznika) - dla `back_text`
  │   ├── Button (Shadcn/ui) - "Zapisz"
  │   └── Button (Shadcn/ui) - "Anuluj"
  ├── ConfirmationModal (komponent React, używa Shadcn/ui AlertDialog) - dla potwierdzenia usunięcia
  │   ├── Button (Shadcn/ui) - "Potwierdź usunięcie"
  │   └── Button (Shadcn/ui) - "Anuluj"
  └── Toast (Shadcn/ui Toaster) - do wyświetlania powiadomień o sukcesie/błędzie
```

## 4. Szczegóły komponentów

### `FlashcardsPage`

- **Opis komponentu:** Główny komponent strony `/flashcards`. Odpowiedzialny za pobieranie listy fiszek, zarządzanie stanem widoku (np. otwarcie modali, paginacja, ładowanie danych, błędy) oraz renderowanie pozostałych komponentów.
- **Główne elementy:** Przycisk "Dodaj nową fiszkę", komponent `PaginatedGrid` do wyświetlania fiszek, komponenty modali (`FlashcardFormModal`, `ConfirmationModal`), `Toast` do powiadomień.
- **Obsługiwane interakcje:**
  - Inicjowanie pobierania fiszek przy załadowaniu strony i zmianie strony paginacji.
  - Otwieranie modala dodawania fiszki.
  - Przekazywanie akcji edycji/usunięcia do odpowiednich komponentów i modali.
- **Obsługiwana walidacja:** Brak bezpośredniej walidacji; deleguje do `FlashcardFormModal`.
- **Typy:** `ListFlashcardsResponseDto`, `FlashcardDto[]`, `PaginationDto`.
- **Propsy:** Brak (jest to komponent strony najwyższego poziomu dla tego widoku).

### `PaginatedGrid`

- **Opis komponentu:** Wyświetla listę fiszek w formie siatki lub listy z kontrolkami paginacji. Abstrakcyjny komponent, który przyjmuje dane i funkcję renderującą pojedynczy element.
- **Główne elementy:** Kontener na elementy siatki/listy, kontrolki paginacji (przyciski "następna strona", "poprzednia strona", numery stron).
- **Obsługiwane interakcje:**
  - Zmiana strony (wywołuje `onPageChange`).
- **Obsługiwana walidacja:** Brak.
- **Typy:** `FlashcardDto[]` (jako `items`), `PaginationDto`.
- **Propsy:**
  - `items: FlashcardDto[]` - tablica fiszek do wyświetlenia.
  - `pagination: PaginationDto` - obiekt z informacjami o paginacji.
  - `onPageChange: (page: number) => void` - funkcja zwrotna wywoływana przy zmianie strony.
  - `renderItem: (item: FlashcardDto) => React.ReactNode` - funkcja renderująca pojedynczą fiszkę (zwraca komponent `FlashcardCard`).
  - `isLoading: boolean` - informuje, czy dane są ładowane.

### `FlashcardCard`

- **Opis komponentu:** Reprezentuje pojedynczą fiszkę w siatce. Wyświetla jej kluczowe informacje oraz przyciski akcji (Edytuj, Usuń).
- **Główne elementy:** Kontener karty, elementy tekstowe dla `front_text`, `back_text`, `created_at`, komponent `Badge` dla `source`, przyciski "Edytuj" i "Usuń".
- **Obsługiwane interakcje:**
  - Kliknięcie przycisku "Edytuj" (wywołuje `onEdit`).
  - Kliknięcie przycisku "Usuń" (wywołuje `onDelete`).
- **Obsługiwana walidacja:** Brak.
- **Typy:** `FlashcardDto`.
- **Propsy:**
  - `flashcard: FlashcardDto` - obiekt fiszki.
  - `onEdit: (flashcard: FlashcardDto) => void` - funkcja zwrotna wywoływana po kliknięciu "Edytuj".
  - `onDelete: (flashcardId: string) => void` - funkcja zwrotna wywoływana po kliknięciu "Usuń".

### `FlashcardFormModal`

- **Opis komponentu:** Modalny formularz do tworzenia nowej lub edycji istniejącej fiszki. Zawiera pola na przód i tył fiszki oraz liczniki znaków.
- **Główne elementy:** Komponent `Dialog` (Shadcn/ui), `Input` (Shadcn/ui) dla `front_text`, `Textarea` (Shadcn/ui) dla `back_text` z dołączonym licznikiem znaków, przyciski "Zapisz" i "Anuluj".
- **Obsługiwane interakcje:**
  - Wprowadzanie tekstu w pola formularza.
  - Zmiana wartości w polach (aktualizacja liczników znaków i stanu formularza).
  - Zapisanie formularza (wywołuje `onSubmit`).
  - Anulowanie/zamknięcie modala (wywołuje `onClose`).
- **Obsługiwana walidacja:**
  - `front_text`: pole wymagane, maksymalnie 200 znaków.
  - `back_text`: pole wymagane, maksymalnie 500 znaków.
  - Komunikaty o błędach walidacji wyświetlane przy polach.
  - Przycisk "Zapisz" jest nieaktywny, jeśli formularz jest niepoprawny.
- **Typy:** `FlashcardDto` (dla `initialData`), `FlashcardFormViewModel`.
- **Propsy:**
  - `isOpen: boolean` - kontroluje widoczność modala.
  - `onClose: () => void` - funkcja zamykająca modal.
  - `onSubmit: (data: FlashcardFormViewModel) => Promise<void>` - funkcja wywoływana przy zapisie formularza.
  - `initialData?: FlashcardDto` - dane fiszki do edycji (opcjonalne).
  - `mode: 'add' | 'edit'` - tryb pracy modala.

### `TextareaWithCounter`

- **Opis komponentu:** Komponent łączący `Textarea` z Shadcn/ui z logiką wyświetlania licznika wprowadzonych znaków oraz maksymalnej liczby znaków.
- **Główne elementy:** `Textarea`, element tekstowy wyświetlający `aktualna_liczba_znaków / maksymalna_liczba_znaków`.
- **Obsługiwane interakcje:** Wprowadzanie tekstu.
- **Obsługiwana walidacja:** Pośrednio, poprzez `maxLength` i informację wizualną licznika.
- **Typy:** `string` (dla `value`).
- **Propsy:**
  - Standardowe propsy dla `Textarea` (np. `value`, `onChange`).
  - `maxLength: number` - maksymalna dozwolona liczba znaków.

### `ConfirmationModal`

- **Opis komponentu:** Modal potwierdzający akcję usunięcia fiszki.
- **Główne elementy:** Komponent `AlertDialog` (Shadcn/ui), tekst pytania (np. "Czy na pewno chcesz usunąć tę fiszkę?"), przyciski "Potwierdź usunięcie" i "Anuluj".
- **Obsługiwane interakcje:**
  - Kliknięcie "Potwierdź usunięcie" (wywołuje `onConfirm`).
  - Kliknięcie "Anuluj" lub zamknięcie modala (wywołuje `onClose`).
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak.
- **Propsy:**
  - `isOpen: boolean` - kontroluje widoczność modala.
  - `onClose: () => void` - funkcja zamykająca modal.
  - `onConfirm: () => void` - funkcja wywoływana po potwierdzeniu akcji.
  - `title: string` - tytuł modala.
  - `message: string` - treść wiadomości/pytania.

## 5. Typy

Kluczowe typy danych używane w widoku:

- **`FlashcardDto` (z `src/types.ts`):**
  ```typescript
  export type FlashcardDto = {
    id: string; // uuid
    generation_id: string | null; // uuid
    front_text: string;
    back_text: string;
    source: "manual" | "ai-full" | "ai-edited";
    created_at: string; // ISO8601
    updated_at: string; // ISO8601
  };
  ```
- **`PaginationDto` (z `src/types.ts`):**
  ```typescript
  export interface PaginationDto {
    page: number;
    pageSize: number; // Zwracane przez API, endpoint używa page_size
    total: number;
  }
  ```
- **`ListFlashcardsResponseDto` (z `src/types.ts`):**
  ```typescript
  export interface ListFlashcardsResponseDto {
    data: FlashcardDto[];
    pagination: PaginationDto;
  }
  ```
- **`CreateFlashcardApiCommand` (dla ciała żądania POST):**
  ```typescript
  // Używany jako część CreateFlashcardsCommandDto
  // type CreateFlashcardPayload = Pick<FlashcardRow, "generation_id" | "front_text" | "back_text"> & { source: FlashcardSource };
  // Dla pojedynczej fiszki tworzonej manualnie:
  interface CreateManualFlashcardPayload {
    front_text: string;
    back_text: string;
    source: "manual";
    generation_id: null;
  }
  export interface CreateFlashcardsApiCommand {
    // Odpowiada CreateFlashcardsCommandDto
    cards: CreateManualFlashcardPayload[]; // W tym widoku tworzymy pojedynczą fiszkę
  }
  ```
- **`UpdateFlashcardApiCommand` (dla ciała żądania PUT, odpowiada `UpdateFlashcardCommandDto` z `src/types.ts`):**
  ```typescript
  export type UpdateFlashcardApiCommand = {
    front_text: string;
    back_text: string;
    source: "manual" | "ai-edited"; // FlashcardUpdateSource
  };
  ```
- **`FlashcardFormViewModel` (ViewModel dla formularza `FlashcardFormModal`):**
  ```typescript
  export interface FlashcardFormViewModel {
    front_text: string;
    back_text: string;
    // source jest dedukowany przy wysyłaniu na podstawie trybu (add/edit) i oryginalnych danych
  }
  ```
  Podczas wysyłania, `source` dla `UpdateFlashcardApiCommand` jest ustalane:
  - Jeśli edytowana fiszka miała `source: 'ai-full'` i tekst został zmieniony, nowe `source` to `'ai-edited'`.
  - W przeciwnym razie `source` pozostaje `'manual'` lub `'ai-edited'`.
    Dla `CreateFlashcardsApiCommand`, `source` to zawsze `'manual'`.

## 6. Zarządzanie stanem

Stan będzie zarządzany głównie w komponencie `FlashcardsPage` przy użyciu haków Reacta (`useState`, `useEffect`).

- **Kluczowe zmienne stanu w `FlashcardsPage`:**

  - `flashcards: FlashcardDto[]`: Lista aktualnie wyświetlanych fiszek.
  - `pagination: PaginationDto | null`: Informacje o paginacji.
  - `currentPage: number`: Aktualnie wybrana strona (domyślnie 1).
  - `isLoading: boolean`: Status ładowania danych z API.
  - `error: string | null`: Komunikat błędu z API.
  - `isAddModalOpen: boolean`: Widoczność modala dodawania.
  - `isEditModalOpen: boolean`: Widoczność modala edycji.
  - `editingFlashcard: FlashcardDto | null`: Fiszka aktualnie edytowana.
  - `isConfirmDeleteModalOpen: boolean`: Widoczność modala potwierdzenia usunięcia.
  - `deletingFlashcardId: string | null`: ID fiszki przeznaczonej do usunięcia.
  - `toastNotification: { id: string, title: string; description: string; variant: 'success' | 'error' } | null`: Konfiguracja dla Toasta.

- **Stan formularza w `FlashcardFormModal`:**

  - Wewnętrzny stan dla pól `front_text`, `back_text` oraz błędów walidacji. Można rozważyć użycie biblioteki typu `react-hook-form` z `zod-resolver` dla uproszczenia zarządzania formularzem i walidacji.

- **Niestandardowe hooki:**
  - `useFlashcardsApi` (opcjonalny, ale zalecany): Hook do enkapsulacji logiki komunikacji z API (GET, POST, PUT, DELETE), zarządzania stanami `isLoading` i `error`. Może używać wewnętrznie `fetch` lub biblioteki typu SWR/React Query dla bardziej zaawansowanych funkcji.

## 7. Integracja API

Komunikacja z backendem odbywa się poprzez API opisane w dokumentacji. Wykorzystane zostaną następujące endpointy:

- **`GET /api/flashcards`**:

  - **Cel:** Pobranie listy fiszek użytkownika z paginacją.
  - **Parametry zapytania:** `page` (numer strony), `pageSize` (liczba elementów na stronie, np. 15).
  - **Typ odpowiedzi:** `ListFlashcardsResponseDto`.
  - **Użycie:** Przy pierwszym ładowaniu widoku oraz przy zmianie strony w `PaginatedGrid`.

- **`POST /api/flashcards`**:

  - **Cel:** Utworzenie nowej fiszki.
  - **Ciało żądania:** `CreateFlashcardsApiCommand` (zawierające jedną fiszkę z `source: 'manual'`).
    ```json
    {
      "cards": [{ "front_text": "...", "back_text": "...", "source": "manual", "generation_id": null }]
    }
    ```
  - **Typ odpowiedzi (sukces 201):** `CreateFlashcardsResponseDto` (zawierająca tablicę z utworzoną fiszką).
  - **Użycie:** Po wypełnieniu i zapisaniu formularza w `FlashcardFormModal` w trybie 'dodaj'.

- **`PUT /api/flashcards/:id`**:

  - **Cel:** Aktualizacja istniejącej fiszki.
  - **Parametr ścieżki:** `id` fiszki.
  - **Ciało żądania:** `UpdateFlashcardApiCommand`.
    ```json
    {
      "front_text": "...",
      "back_text": "...",
      "source": "manual" // lub "ai-edited"
    }
    ```
  - **Typ odpowiedzi (sukces 200):** `GetFlashcardResponseDto` (zaktualizowana fiszka).
  - **Użycie:** Po wypełnieniu i zapisaniu formularza w `FlashcardFormModal` w trybie 'edytuj'.

- **`DELETE /api/flashcards/:id`**:
  - **Cel:** Usunięcie fiszki.
  - **Parametr ścieżki:** `id` fiszki.
  - **Typ odpowiedzi (sukces 204):** Brak zawartości.
  - **Użycie:** Po potwierdzeniu usunięcia w `ConfirmationModal`.

Po każdej operacji CUD (Create, Update, Delete) lista fiszek powinna zostać odświeżona (np. przez ponowne pobranie danych dla bieżącej strony) lub zaktualizowana optymistycznie.

## 8. Interakcje użytkownika

- **Przeglądanie fiszek:**
  - Użytkownik widzi listę/siatkę swoich fiszek.
  - Może nawigować między stronami za pomocą kontrolek paginacji.
- **Dodawanie fiszki:**
  - Kliknięcie przycisku "Dodaj nową fiszkę" otwiera `FlashcardFormModal`.
  - Użytkownik wypełnia pola "przód" i "tył", przestrzegając limitów znaków (widoczne liczniki).
  - Kliknięcie "Zapisz": walidacja -> wysłanie żądania `POST` -> zamknięcie modala -> odświeżenie listy -> toast o sukcesie.
  - Kliknięcie "Anuluj" zamyka modal bez zapisywania.
- **Edycja fiszki:**
  - Kliknięcie przycisku "Edytuj" na karcie fiszki otwiera `FlashcardFormModal` z wypełnionymi danymi tej fiszki.
  - Użytkownik modyfikuje dane.
  - Kliknięcie "Zapisz": walidacja -> wysłanie żądania `PUT` -> zamknięcie modala -> odświeżenie listy -> toast o sukcesie.
  - Kliknięcie "Anuluj" zamyka modal.
- **Usuwanie fiszki:**
  - Kliknięcie przycisku "Usuń" na karcie fiszki otwiera `ConfirmationModal`.
  - Kliknięcie "Potwierdź usunięcie": wysłanie żądania `DELETE` -> zamknięcie modala -> odświeżenie listy -> toast o sukcesie.
  - Kliknięcie "Anuluj" zamyka modal.

## 9. Warunki i walidacja

- **`FlashcardFormModal` (dodawanie i edycja):**
  - Pole "przód" (`front_text`):
    - Wymagane.
    - Maksymalnie 200 znaków. Komunikat: "Przekroczono limit znaków (maksymalnie 200)".
    - Walidacja na bieżąco, licznik znaków.
  - Pole "tył" (`back_text`):
    - Wymagane.
    - Maksymalnie 500 znaków. Komunikat: "Przekroczono limit znaków (maksymalnie 500)".
    - Walidacja na bieżąco, licznik znaków.
  - Przycisk "Zapisz" jest nieaktywny, jeśli którekolwiek z pól nie spełnia warunków walidacji lub jest puste.
- **Logika `source` przy edycji:**
  - Jeśli oryginalna fiszka miała `source: 'ai-full'` i użytkownik zmodyfikował `front_text` lub `back_text`, to przy wysyłaniu żądania `PUT` `source` musi zostać zmienione na `'ai-edited'`.
  - W pozostałych przypadkach (`source: 'manual'` lub `source: 'ai-edited'`) `source` pozostaje bez zmian.

## 10. Obsługa błędów

- **Błędy walidacji formularza:** Wyświetlane bezpośrednio przy polach w `FlashcardFormModal`. Modal pozostaje otwarty.
- **Błędy API (ogólne):**
  - Błędy sieciowe / niedostępność serwera (status 5xx): Wyświetlenie generycznego komunikatu błędu za pomocą `Toast` (np. "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później."). Logowanie błędu do konsoli.
  - Błąd 401 Unauthorized (np. wygaśnięcie sesji): Przekierowanie na stronę logowania. Middleware Astro powinno to obsłużyć globalnie.
- **Błędy API (specyficzne dla endpointów):**
  - `POST /api/flashcards` lub `PUT /api/flashcards/:id`:
    - Błąd 400 Bad Request (np. walidacja serwerowa nie powiodła się): Wyświetlenie szczegółowego komunikatu błędu z odpowiedzi API w `Toast` lub w formularzu. Modal pozostaje otwarty.
    - Błąd 404 Not Found (dla `PUT`, jeśli fiszka została usunięta w międzyczasie): Wyświetlenie `Toast` ("Nie znaleziono fiszki. Mogła zostać usunięta."), odświeżenie listy.
  - `DELETE /api/flashcards/:id`:
    - Błąd 404 Not Found (jeśli fiszka została już usunięta): Wyświetlenie `Toast` ("Nie znaleziono fiszki. Mogła już zostać usunięta."), odświeżenie listy.
- **Stan ładowania:** Podczas operacji API przyciski akcji (np. "Zapisz" w modalu) powinny być nieaktywne i/lub pokazywać wskaźnik ładowania, aby zapobiec wielokrotnemu wysyłaniu żądań. `PaginatedGrid` powinien pokazywać wskaźnik ładowania podczas pobierania danych.

## 11. Kroki implementacji

1.  **Utworzenie struktury plików:**
    - Strona Astro: `src/pages/flashcards.astro` (lub `.tsx` jeśli cała strona będzie komponentem React).
    - Komponenty React w `src/components/flashcards/`: `FlashcardsPageContent.tsx` (jeśli strona Astro), `PaginatedGrid.tsx`, `FlashcardCard.tsx`, `FlashcardFormModal.tsx`, `TextareaWithCounter.tsx`, `ConfirmationModal.tsx`.
    - Niezbędne typy zostaną zaimportowane z `src/types.ts`.
2.  **Implementacja `FlashcardsPage` / `FlashcardsPageContent`:**
    - Podstawowy layout strony.
    - Logika pobierania fiszek (hook `useEffect` do pobrania danych przy montowaniu i zmianie `currentPage`).
    - Zarządzanie stanami (ładowanie, błędy, paginacja, otwarcie modali).
    - Renderowanie przycisku "Dodaj nową fiszkę".
    - Renderowanie `PaginatedGrid`.
3.  **Implementacja `PaginatedGrid`:**
    - Przyjmowanie `items`, `pagination`, `onPageChange`, `renderItem`, `isLoading`.
    - Renderowanie siatki/listy elementów za pomocą `renderItem(item)`.
    - Implementacja kontrolek paginacji i wywoływanie `onPageChange`.
    - Wyświetlanie stanu ładowania.
4.  **Implementacja `FlashcardCard`:**
    - Wyświetlanie danych fiszki (`front_text`, `back_text`, `source` jako `Badge`, `created_at`).
    - Przyciski "Edytuj" i "Usuń" wywołujące odpowiednie callbacki (`onEdit`, `onDelete`).
5.  **Implementacja `FlashcardFormModal`:**
    - Formularz z polami `Input` dla `front_text` i `TextareaWithCounter` dla `back_text`.
    - Logika walidacji (limity znaków, pola wymagane).
    - Obsługa trybów 'dodaj' i 'edytuj' (wypełnianie pól dla edycji).
    - Wywoływanie `onSubmit` z danymi formularza (`FlashcardFormViewModel`).
    - Logika ustalania `source` dla API call.
6.  **Implementacja `TextareaWithCounter`:**
    - Komponent opakowujący `Textarea` z Shadcn/ui.
    - Wyświetlanie licznika znaków `current/max`.
7.  **Implementacja `ConfirmationModal`:**
    - Wyświetlanie komunikatu potwierdzenia.
    - Przyciski "Potwierdź" i "Anuluj" wywołujące callbacki.
8.  **Integracja API:**
    - Stworzenie funkcji (lub hooka `useFlashcardsApi`) do komunikacji z endpointami `/api/flashcards`.
    - Obsługa żądań GET, POST, PUT, DELETE z odpowiednimi typami i obsługą błędów.
9.  **Obsługa interakcji i stanu:**
    - Połączenie akcji użytkownika (kliknięcia przycisków) z logiką otwierania modali i wywoływania API.
    - Aktualizacja listy fiszek po operacjach CRUD (refetch lub aktualizacja optymistyczna).
    - Wyświetlanie powiadomień `Toast`.
10. **Styling i dostępność (WCAG AA):**
    - Użycie Tailwind CSS i komponentów Shadcn/ui.
    - Zapewnienie dostępności klawiaturowej, odpowiednich atrybutów ARIA, zarządzania focusem (szczególnie w modalach - focus trap).
11. **Testowanie:**
    - Testy jednostkowe dla logiki komponentów (np. walidacja w formularzu).
    - Testy integracyjne dla przepływów użytkownika (dodawanie, edycja, usuwanie fiszki).
    - Testy E2E dla całego widoku.
    - Testy dostępności (np. z `axe-core`).
