# Plan implementacji widoku Generowania Fiszki (AI)

## 1. Przegląd

Widok "Generuj" (`/generate`) umożliwia zalogowanym użytkownikom wprowadzenie tekstu o długości 1000–10000 znaków, wysłanie go do usługi AI w celu wygenerowania propozycji fiszek, a następnie przeglądanie, edytowanie, akceptowanie lub odrzucanie tych propozycji przed zapisaniem wybranych fiszek w systemie. Widok ten jest kluczowym elementem aplikacji, automatyzującym proces tworzenia fiszek.

## 2. Routing widoku

Widok powinien być dostępny pod ścieżką `/generate`. Dostęp do tej ścieżki powinien być chroniony i wymagać zalogowania użytkownika. Niezalogowani użytkownicy próbujący uzyskać dostęp powinni być przekierowani na stronę logowania (`/login`).

## 3. Struktura komponentów

Widok będzie zaimplementowany jako React Island wewnątrz strony Astro (`src/pages/generate.astro`). Poniżej znajduje się proponowana hierarchia komponentów React:

```
GenerateView (React Island @ src/components/views/GenerateView.tsx)
├── TextInputSection (@ src/components/generate/TextInputSection.tsx)
│   ├── TextareaWithCounter (@ src/components/ui/TextareaWithCounter.tsx - wrapper Shadcn Textarea)
│   ├── ValidationMessage (@ src/components/ui/ValidationMessage.tsx)
│   └── Button (Generate - Shadcn Button)
├── CandidateListSection (@ src/components/generate/CandidateListSection.tsx)
│   ├── Skeleton[] (Conditional - Shadcn Skeleton)
│   └── BatchActionBar (Conditional @ src/components/generate/BatchActionBar.tsx)
│       ├── Button (Save All - Shadcn Button)
│       └── Button (Save Accepted - Shadcn Button)
│   ├── CandidateCard[] (Conditional @ src/components/generate/CandidateCard.tsx)
│   │   ├── Button (Accept - Shadcn Button)
│   │   ├── Button (Edit - Shadcn Button)
│   │   └── Button (Reject - Shadcn Button)
└── EditFlashcardModal (Conditional @ src/components/generate/EditFlashcardModal.tsx - wrapper Shadcn Dialog)
    ├── TextareaWithCounter (Front)
    ├── ValidationMessage (Front)
    ├── TextareaWithCounter (Back)
    ├── ValidationMessage (Back)
    └── Button (Save - Shadcn Button), Button (Cancel - Shadcn Button)
(Globalnie używany Shadcn Toaster do powiadomień)
```

## 4. Szczegóły komponentów

### `GenerateView`

- **Opis:** Główny kontener widoku, renderowany jako React Island. Zarządza stanem całego procesu generowania (wprowadzanie tekstu, ładowanie, lista kandydatów, zapisywanie), obsługuje wywołania API i koordynuje interakcje między komponentami podrzędnymi.
- **Główne elementy:** `TextInputSection`, `CandidateListSection`, `EditFlashcardModal`. Wykorzystuje `useToast` do powiadomień o sukcesie. Wyświetla błędy API inline.
- **Obsługiwane interakcje:** Inicjuje proces generowania po otrzymaniu zdarzenia z `TextInputSection`, obsługuje akcje na kandydatach (edycja, akceptacja, odrzucenie) delegowane z `CandidateListSection`, zarządza otwieraniem/zamykaniem `EditFlashcardModal`, inicjuje zapisywanie po otrzymaniu zdarzenia z `BatchActionBar`.
- **Obsługiwana walidacja:** Pośrednio, poprzez zarządzanie stanem `isValidInput` na podstawie walidacji w `TextInputSection`. Wyświetla błędy inline.
- **Typy:** `ViewModelCandidate[]`, `CreateGenerationCommand`, `CreateGenerationResponseDto`, `CreateFlashcardsCommandDto`, `FlashcardDto`. Zarządza stanami `generationStatus`, `saveStatus`, `generationError: string | null`, `saveError: string | null`, `editingCandidateId`.
- **Propsy:** Brak (jest to komponent najwyższego poziomu dla tej funkcjonalności).

### `TextInputSection`

- **Opis:** Sekcja zawierająca pole tekstowe do wprowadzania tekstu źródłowego oraz przycisk do rozpoczęcia generowania fiszek. Odpowiada za walidację wprowadzanego tekstu.
- **Główne elementy:** `TextareaWithCounter`, `ValidationMessage`, `Button` (Generate).
- **Obsługiwane interakcje:** Aktualizacja stanu wewnętrznego `inputText` przy zmianie w `TextareaWithCounter`, wywołanie funkcji `onGenerateSubmit` przekazanej w propsach po kliknięciu przycisku "Generate" (jeśli tekst jest poprawny i nie trwa ładowanie).
- **Obsługiwana walidacja:** Długość tekstu (min. 1000, maks. 10000 znaków). Wyświetla odpowiedni komunikat w `ValidationMessage` i zarządza stanem `disabled` przycisku "Generate".
- **Typy:** `string` (dla wewnętrznego stanu `inputText`), `boolean` (dla `isLoading` z propsów).
- **Propsy:** `isLoading: boolean`, `onGenerateSubmit: (text: string) => void`.

### `TextareaWithCounter`

- **Opis:** Komponent opakowujący `Textarea` z Shadcn/ui, dodający licznik znaków.
- **Główne elementy:** `div` (wrapper), `Textarea` (Shadcn), `span` (licznik).
- **Obsługiwane interakcje:** Przekazuje zdarzenie `onChange` do rodzica.
- **Obsługiwana walidacja:** Pośrednio, poprzez `maxLength`.
- **Typy:** `string` (value), `number` (maxLength, minLength).
- **Propsy:** `value: string`, `onChange: (event) => void`, `maxLength: number`, `minLength: number`, `placeholder?: string`, `id?: string`, `aria-describedby?: string`.

### `ValidationMessage`

- **Opis:** Wyświetla komunikaty walidacyjne (np. dotyczące długości tekstu). Używa `aria-live="polite"` do informowania technologii asystujących.
- **Główne elementy:** `p` z odpowiednimi atrybutami ARIA i stylami Tailwind.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak (tylko wyświetla).
- **Typy:** `string` (message).
- **Propsy:** `message: string | null`, `id?: string`.

### `CandidateListSection`

- **Opis:** Sekcja wyświetlająca listę wygenerowanych kandydatów na fiszki lub szkielety ładowania. Zawiera również pasek akcji zbiorczych.
- **Główne elementy:** `Skeleton[]` (gdy `isLoading`), `BatchActionBar` (gdy są kandydaci), `CandidateCard[]` (gdy są kandydaci).
- **Obsługiwane interakcje:** Deleguje zdarzenia `onEdit`, `onAcceptToggle`, `onReject` z `CandidateCard` oraz `onSaveAll` i `onSaveAccepted` z `BatchActionBar` do komponentu rodzica (`GenerateView`).
- **Obsługiwana walidacja:** Brak.
- **Typy:** `ViewModelCandidate[]`, `boolean` (isLoading).
- **Propsy:** `candidates: ViewModelCandidate[]`, `isLoading: boolean`, `onEdit: (id: string) => void`, `onAcceptToggle: (id: string) => void`, `onReject: (id: string) => void`, `onSaveAll: () => void`, `onSaveAccepted: () => void`.

### `BatchActionBar`

- **Opis:** Pasek narzędziowy pojawiający się, gdy lista kandydatów nie jest pusta. Wyświetla liczbę zaakceptowanych fiszek oraz przyciski do zapisania wszystkich lub tylko zaakceptowanych.
- **Główne elementy:** `div` (kontener), `span` (licznik zaakceptowanych), `Button` ("Zapisz wszystko"), `Button` ("Zapisz zaakceptowane").
- **Obsługiwane interakcje:** Wywołuje `onSaveAll` po kliknięciu przycisku "Zapisz wszystko". Wywołuje `onSaveAccepted` po kliknięciu przycisku "Zapisz zaakceptowane" (jeśli są zaakceptowane fiszki).
- **Obsługiwana walidacja:** Przycisk "Zapisz zaakceptowane" jest wyłączony (`disabled`), jeśli `acceptedCount` wynosi 0.
- **Typy:** `number` (acceptedCount).
- **Propsy:** `acceptedCount: number`, `onSaveAll: () => void`, `onSaveAccepted: () => void`, `isSaving: boolean`.

### `CandidateCard`

- **Opis:** Reprezentuje pojedynczą propozycję fiszki wygenerowaną przez AI. Wyświetla przód i tył fiszki oraz przyciski akcji (Akceptuj, Edytuj, Odrzuć). Karta powinna wizualnie wskazywać, czy jest zaakceptowana (np. poprzez zmianę tła lub obramowania).
- **Główne elementy:** `div` (kontener karty, stylizowany warunkowo na podstawie `isAccepted`), `p` (front), `p` (back), `Button` (Akceptuj), `Button` (Edytuj), `Button` (Odrzuć).
- **Obsługiwane interakcje:** Wywołuje `onAcceptToggle(id)`, `onEdit(id)`, `onReject(id)` przekazane w propsach. Kliknięcie "Akceptuj" przełącza stan `isAccepted`. Kliknięcie "Odrzuć" usuwa kandydata.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `ViewModelCandidate`.
- **Propsy:** `candidate: ViewModelCandidate`, `onAcceptToggle: (id: string) => void`, `onEdit: (id: string) => void`, `onReject: (id: string) => void`.

### `EditFlashcardModal`

- **Opis:** Modal (dialog) do edycji treści (przód/tył) wybranej kandydatury na fiszkę. Używa komponentu `Dialog` z Shadcn/ui. Zawiera walidację długości pól.
- **Główne elementy:** `Dialog`, `DialogContent`, `DialogHeader` (`DialogTitle`, `DialogDescription`), `TextareaWithCounter` (dla przodu), `ValidationMessage` (dla przodu), `TextareaWithCounter` (dla tyłu), `ValidationMessage` (dla tyłu), `DialogFooter`, `Button` (Zapisz), `Button` (Anuluj).
- **Obsługiwane interakcje:** Aktualizacja wewnętrznego stanu edytowanego tekstu, wywołanie `onSave` z ID kandydata i nowymi tekstami po kliknięciu "Zapisz" (jeśli walidacja przejdzie), wywołanie `onCancel` po kliknięciu "Anuluj" lub zamknięciu dialogu.
- **Obsługiwana walidacja:** Długość tekstu `front_text` (maks. 200 znaków), długość tekstu `back_text` (maks. 500 znaków). Wyświetla komunikaty w `ValidationMessage`, zarządza stanem `disabled` przycisku "Zapisz". Implementuje focus trap (wbudowane w Shadcn `Dialog`).
- **Typy:** `ViewModelCandidate` (dane inicjalne), wewnętrzny stan dla `editedFront`, `editedBack`.
- **Propsy:** `isOpen: boolean`, `candidate: ViewModelCandidate | null`, `onSave: (id: string, frontText: string, backText: string) => void`, `onCancel: () => void`.

## 5. Typy

Oprócz typów DTO importowanych z `src/types.ts` (`CreateGenerationCommand`, `CreateGenerationResponseDto`, `GenerationCandidateDto`, `CreateFlashcardsCommandDto`, `FlashcardDto`, `FlashcardSource`), kluczowy będzie lokalny typ ViewModel:

- **`ViewModelCandidate`**: Reprezentuje kandydata na fiszkę w stanie interfejsu użytkownika.
  - `id: string`: Unikalny identyfikator UUID wygenerowany po stronie klienta (np. `crypto.randomUUID()`) do śledzenia kandydata w UI przed zapisaniem.
  - `front_text: string`: Tekst na przodzie fiszki (≤ 200 znaków).
  - `back_text: string`: Tekst na tyle fiszki (≤ 500 znaków).
  - `isAccepted: boolean`: Flaga wskazująca, czy użytkownik zaakceptował kandydata do zapisania (domyślnie `false`).
  - `isEdited: boolean`: Flaga wskazująca, czy kandydat został zmodyfikowany przez użytkownika (domyślnie `false`).

## 6. Zarządzanie stanem

Stan widoku będzie zarządzany głównie w komponencie `GenerateView` przy użyciu hooków React (`useState`, `useCallback`, potencjalnie `useReducer` lub custom hook `useGeneration`, jeśli logika stanie się bardzo złożona).

- **Kluczowe stany w `GenerateView`:**
  - `inputText: string`: Przechowuje tekst wprowadzany przez użytkownika (może być zarządzany w `TextInputSection` i synchronizowany lub podniesiony do `GenerateView`).
  - `isValidInput: boolean`: Wynik walidacji `inputText`.
  - `generationStatus: 'idle' | 'loading' | 'success' | 'error'`: Stan procesu generowania fiszek przez AI (`POST /api/generations`).
  - `saveStatus: 'idle' | 'loading' | 'success' | 'error'`: Stan procesu zapisywania wybranych fiszek (`POST /api/flashcards`).
  - `candidates: ViewModelCandidate[]`: Lista kandydatów na fiszki otrzymanych z API i wzbogaconych o stan UI (`id`, `isAccepted`, `isEdited`).
  - `generationId: string | null`: ID zwrócone przez API po udanym wygenerowaniu, potrzebne do zapisu fiszek.
  - `generationError: string | null`: Komunikat błędu do wyświetlenia (np. w Toaście) podczas generowania fiszek.
  - `editingCandidateId: string | null`: ID kandydata aktualnie edytowanego w modalu.
- **Custom Hook (`useGeneration`):** Rozważenie stworzenia tego hooka może pomóc w organizacji logiki, enkapsulując zarządzanie stanami związanymi z generowaniem, edycją, akceptacją/odrzuceniem i zapisywaniem, a także obsługę wywołań API.

## 7. Integracja API

- **Generowanie fiszek:**
  - **Wywołanie:** Po kliknięciu przycisku "Generuj" (jeśli tekst jest poprawny).
  - **Endpoint:** `POST /api/generations`
  - **Typ żądania:** `CreateGenerationCommand` (`{ text: string }`)
  - **Typ odpowiedzi (Success 201):** `CreateGenerationResponseDto` (`{ id, ..., candidates: GenerationCandidateDto[] }`)
  - **Obsługa:** Ustawienie `generationStatus` na 'loading', wyczyszczenie `generationError`. Po sukcesie: aktualizacja `generationStatus` na 'success', zapisanie `generationId`, przetworzenie `candidates` na `ViewModelCandidate[]` (z dodaniem `id`, `isAccepted=false`, `isEdited=false`), aktualizacja stanu `candidates`. Po błędzie: aktualizacja `generationStatus` na 'error', ustawienie komunikatu `generationError` do wyświetlenia inline.
- **Zapisywanie zaakceptowanych fiszek:**
  - **Wywołanie:** Po kliknięciu przycisku "Zapisz zaakceptowane".
  - **Endpoint:** `POST /api/flashcards`
  - **Typ żądania:** `CreateFlashcardsCommandDto` (`{ cards: [...] }`). Lista `cards` jest tworzona przez filtrowanie stanu `candidates` (tylko te z `isAccepted=true`), a następnie mapowanie `ViewModelCandidate` do struktury karty w DTO, ustawiając `generation_id` na zapisane `generationId` oraz `source` na `'ai-edited'`, jeśli `isEdited` jest `true`, lub `'ai-full'`, jeśli `isEdited` jest `false`.
  - **Typ odpowiedzi (Success 201):** `CreateFlashcardsResponseDto` (`{ cards: FlashcardDto[] }`)
  - **Obsługa:** Ustawienie `saveStatus` na 'loading', wyczyszczenie `saveError`. Po sukcesie: aktualizacja `saveStatus` na 'success', pokazanie Toastu sukcesu, wyczyszczenie listy `candidates` i `generationId` (lub przekierowanie do `/flashcards`). Po błędzie: aktualizacja `saveStatus` na 'error', ustawienie komunikatu `saveError` do wyświetlenia inline.
  - **Zapisywanie wszystkich fiszek:**
    - **Wywołanie:** Po kliknięciu przycisku "Zapisz wszystko".
    - **Endpoint:** `POST /api/flashcards`
    - **Typ żądania:** `CreateFlashcardsCommandDto` (`{ cards: [...] }`). Lista `cards` jest tworzona przez mapowanie **wszystkich** `ViewModelCandidate` ze stanu `candidates` do struktury karty w DTO, ustawiając `generation_id` na zapisane `generationId` oraz `source` na `'ai-edited'`, jeśli `isEdited` jest `true`, lub `'ai-full'`, jeśli `isEdited` jest `false` dla każdej karty.
    - **Typ odpowiedzi (Success 201):** `CreateFlashcardsResponseDto` (`{ cards: FlashcardDto[] }`)
    - **Obsługa:** Analogiczna do zapisywania zaakceptowanych (ustawienie `saveStatus` na 'loading', wyczyszczenie `saveError`. Po sukcesie: pokazanie Toastu sukcesu, czyszczenie stanu. Po błędzie: ustawienie `saveError` do wyświetlenia inline).

## 8. Interakcje użytkownika

- **Wprowadzanie tekstu:** Licznik znaków aktualizuje się na bieżąco. Komunikat walidacyjny pojawia się/znika. Przycisk "Generuj" jest (de)aktywowany.
- **Kliknięcie "Generuj":** Przycisk staje się nieaktywny, pojawia się wskaźnik ładowania (`Skeleton` w miejscu listy kandydatów, loader w prefixie buttona). Po zakończeniu (sukces): lista kandydatów jest wyświetlana, ewentualny poprzedni błąd inline znika. Po zakończeniu (błąd): pojawia się komunikat błędu inline pod przyciskiem "Generuj".
- **Kliknięcie "Akceptuj" na kandydacie:** Stan `isAccepted` kandydata jest przełączany. Karta wizualnie zmienia wygląd. Licznik w `BatchActionBar` się aktualizuje.
- **Kliknięcie "Edytuj" na kandydacie:** Otwiera się `EditFlashcardModal` wypełniony danymi tego kandydata.
- **Kliknięcie "Odrzuć" na kandydacie:** Stan `isAccepted` kandydata jest przełączany na false. Licznik w `BatchActionBar` się aktualizuje.
- **Edycja w modalu:** Walidacja długości pól na bieżąco, przycisk "Zapisz" (de)aktywowany.
- **Kliknięcie "Zapisz" w modalu:** Modal się zamyka, dane kandydata w liście `candidates` są aktualizowane (`front_text`, `back_text`, `isEdited=true`).
- **Kliknięcie "Anuluj" w modalu:** Modal się zamyka, brak zmian.
- **Kliknięcie "Zapisz wszystko":** Przycisk może pokazywać stan ładowania. Wywoływane jest API w celu zapisania _wszystkich_ aktualnie wyświetlanych kandydatów. Po zakończeniu (sukces): Toast sukcesu, lista kandydatów znika, ewentualny poprzedni błąd inline znika. Po zakończeniu (błąd): pojawia się komunikat błędu inline przy `BatchActionBar`.
- **Kliknięcie "Zapisz zaakceptowane":** Przycisk może pokazywać stan ładowania. Wywoływane jest API w celu zapisania _tylko_ kandydatów z `isAccepted=true`. Po zakończeniu (sukces): Toast sukcesu, lista kandydatów znika, ewentualny poprzedni błąd inline znika. Po zakończeniu (błąd): pojawia się komunikat błędu inline przy `BatchActionBar`.

## 9. Warunki i walidacja

- **Długość tekstu wejściowego:** Weryfikowana w `TextInputSection` (min 1000, max 10000 znaków). Wpływa na `ValidationMessage` i stan `disabled` przycisku "Generuj".
- **Długość tekstu fiszki (przód):** Weryfikowana w `EditFlashcardModal` (max 200 znaków). Wpływa na `ValidationMessage` w modalu i stan `disabled` przycisku "Zapisz" w modalu.
- **Długość tekstu fiszki (tył):** Weryfikowana w `EditFlashcardModal` (max 500 znaków). Wpływa na `ValidationMessage` w modalu i stan `disabled` przycisku "Zapisz" w modalu.
- **Liczba zaakceptowanych kandydatów:** Weryfikowana w `GenerateView` (lub `BatchActionBar`). Wpływa na stan `disabled` przycisku "Zapisz zaakceptowane".

## 10. Obsługa błędów

- **Błędy walidacji (frontend):** Obsługiwane przez wyświetlanie komunikatów (`ValidationMessage`) i blokowanie przycisków (`disabled`).
- **Błędy API (`/api/generations`, `/api/flashcards`):**
  - `400 Bad Request`, `429 Too Many Requests`, `500 Internal Server Error` lub błędy sieci: Powinny skutkować wyświetleniem komunikatu błędu inline, blisko elementu UI, który wywołał akcję (np. pod przyciskiem "Generuj" lub w obrębie `BatchActionBar`). Komunikaty powinny być zrozumiałe dla użytkownika.
  - We wszystkich przypadkach błędów API: Zresetować stan ładowania odpowiedniej akcji, zachować stan formularza/listy kandydatów (o ile to możliwe), zalogować szczegóły błędu w konsoli deweloperskiej.
- **Powiadomienia Toast:** Używane głównie do potwierdzenia sukcesu operacji (np. "Pomyślnie zapisano X fiszek.").
- **Globalny Error Boundary:** Nadal zalecane do łapania nieoczekiwanych błędów renderowania React, które nie zostały obsłużone lokalnie.

## 11. Kroki implementacji

1.  **Stworzenie strony Astro:** Utworzyć plik `src/pages/generate.astro`. Dodać podstawowy layout (`src/layouts/Layout.astro`) i zabezpieczenie trasy (przekierowanie niezalogowanych użytkowników - prawdopodobnie w middleware `src/middleware/index.ts`).
2.  **Utworzenie komponentu `GenerateView`:** Stworzyć plik `src/components/views/GenerateView.tsx`. Dodać podstawową strukturę i osadzić go jako client-side island w `generate.astro`.
3.  **Implementacja `TextInputSection`:** Stworzyć komponenty `TextInputSection`, `TextareaWithCounter`, `ValidationMessage`. Zaimplementować logikę wprowadzania tekstu, licznika i walidacji długości. Dodać przycisk "Generuj" i logikę jego (de)aktywacji. Połączyć z `GenerateView`.
4.  **Implementacja stanu ładowania i listy kandydatów:** Stworzyć komponenty `CandidateListSection`, `CandidateCard`, `BatchActionBar`. Dodać obsługę stanu `isLoading` w `GenerateView` do wyświetlania `Skeleton` (z Shadcn) w `CandidateListSection`. Dodać miejsce na wyświetlanie błędów inline w `GenerateView` (blisko `TextInputSection` i `BatchActionBar`).
5.  **Integracja z API `/api/generations`:** Zaimplementować funkcję wywołującą `POST /api/generations` w `GenerateView` (lub `useGeneration`). Obsłużyć stany ładowania, sukcesu (przetwarzanie odpowiedzi na `ViewModelCandidate[]` - ustawienie `isAccepted=false` - aktualizacja stanu, czyszczenie błędu inline) i błędu (ustawienie stanu `generationError`).
6.  **Implementacja akcji na kandydatach:** Dodać przyciski i logikę do `CandidateCard` (Akceptuj, Edytuj, Odrzuć). Zaimplementować obsługę tych akcji w `GenerateView` do aktualizacji stanu `candidates` (przełączanie `isAccepted`, przełączanie na `false` przy odrzuceniu). Połączyć stan `isAccepted` z wyglądem `CandidateCard` i licznikiem/stanem `disabled` przycisku "Zapisz zaakceptowane" w `BatchActionBar`. Dodać obsługę akcji "Zapisz wszystko" w `BatchActionBar` i `GenerateView`.
7.  **Implementacja `EditFlashcardModal`:** Stworzyć komponent modalu używając `Dialog` z Shadcn. Dodać formularz z `TextareaWithCounter` dla przodu i tyłu, walidację długości, przyciski "Zapisz" i "Anuluj". Połączyć z `GenerateView` do zarządzania stanem otwarcia (`isOpen`, `editingCandidateId`) i obsługi zapisu (`onSave`) oraz anulowania (`onCancel`). Aktualizować stan `candidates` (`front_text`, `back_text`, `isEdited=true`) po zapisie w modalu.
8.  **Integracja z API `/api/flashcards`:** Zaimplementować funkcje wywołujące `POST /api/flashcards` w `GenerateView` (lub `useGeneration`), uruchamiane przez przyciski "Zapisz wszystko" i "Zapisz zaakceptowane" w `BatchActionBar`. Przygotować poprawnie listę `cards` dla obu przypadków (mapowanie wszystkich lub filtrowanie `isAccepted`). Obsłużyć stany ładowania, sukcesu (Toast, czyszczenie stanu `saveError` i `candidates`) i błędu (ustawienie stanu `saveError`).
9.  **Dopracowanie UX i dostępności (WCAG AA):** Przejrzeć wszystkie komponenty pod kątem semantyki HTML, użycia ARIA (np. `aria-live`, `aria-describedby`, `role="status"`), zarządzania focusem (szczególnie w modalu), nawigacji klawiaturą. Dodać odpowiednie etykiety (`aria-label`). Upewnić się, że stan akceptacji karty jest przekazywany wizualnie i dla technologii asystujących. Upewnić się, że komunikaty błędów inline są dostępne (`aria-live`, powiązanie z kontrolką przez `aria-describedby`).
10. **Testowanie:** Przetestować wszystkie przepływy użytkownika, walidacje, obsługę błędów (w tym wyświetlanie inline) i przypadki brzegowe (np. pusta odpowiedź z AI, błędy sieciowe), w tym nowe akcje akceptacji i zapisywania.
11. **Integracja z autentykacją:** Upewnić się, że middleware poprawnie chroni stronę, a wywołania API (po stronie serwera) używają rzeczywistego ID użytkownika zamiast `DEFAULT_USER_ID`.
