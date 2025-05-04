# Architektura UI dla Repetix

## 1. Przegląd struktury UI

Repetix będzie oparty na spójnym układzie komponentów Astro/React z centralnym `Layout` zawierającym nawigację (Top Nav) dla chronionych widoków. Strony publiczne (logowanie, rejestracja, reset hasła) korzystają z uproszczonego layoutu bez nawigacji. Aplikacja działa w trybie Mobile-First, wykorzystując Tailwind CSS do responsywnych grid/flex layoutów oraz Shadcn/ui dla atomowych komponentów. Globalny stan (Auth, Generations, Flashcards, Review) zarządzany przez React Context i custom hooki; fetch z interceptorami JWT + obsługa 401.

## 2. Lista widoków

### 2.1 Strony autoryzacji

- **Rejestracja** (`/register`)

  - Cel: Założenie konta email+hasło
  - Informacje: pola `email`, `password`, `confirmPassword`
  - Komponenty: `FormInput`, `PasswordStrengthIndicator`, `InlineError`, `SubmitButton`
  - UX & dostępność: aria-live dla błędów, klawiaturowa nawigacja, jasne komunikaty, walidacja live przed wysłaniem. Bez nawigacji głównej.
  - Bezpieczeństwo: client-side walidacja hasła, HTTPS, przesyłanie przez fetch z CORS.

- **Logowanie** (`/login`)

  - Cel: Uzyskanie tokenu i dostęp do chronionych stron
  - Informacje: pola `email`, `password`
  - Komponenty: `FormInput`, `InlineError`, `SubmitButton`, `ForgotPasswordLink`
  - UX & dostępność: focus na pierwsze pole, aria-describedby dla błędów.

- **Reset hasła** (`/forgot-password`)
  - Cel: Wysłanie linku resetującego
  - Informacje: pole `email`
  - Komponenty: `FormInput`, `InlineError`, `SubmitButton`
  - UX: potwierdzenie wysłania toastem, ochrona przed ujawnianiem stanu konta.

### 2.2 Generowanie fiszek (AI)

- **Generate** (`/generate`)
  - Cel: Wprowadzenie tekstu 1 000–10 000 znaków i wywołanie AI
  - Informacje: textarea z licznikiem znaków; lista kandydatów po wygenerowaniu
  - Komponenty: `TextareaWithCounter`, `ValidationMessage`, `Button`, `Spinner`, `Skeleton`, `CandidateCard`, `EditModal`, `BatchActionBar`, `Toast`
  - UX & dostępność: live validation długości (aria-live), przycisk "Generate" disabled do spełnienia warunków, skeleton placeholders podczas ładowania (role=status), focus trap podczas spinnera i modali, aria-describedby dla edycji fiszki.

### 2.3 Przegląd i zarządzanie fiszkami

- **Flashcards** (`/flashcards`)
  - Cel: Przegląd zapisanych fiszek, CRUD
  - Informacje: lista/grid paginowana (15/page) z kartami `FlashcardCard` zawierającymi front, back, badge `source` i datę utworzenia
  - Komponenty: `PaginatedGrid`, `FlashcardCard`, `Badge`, `Button(Add)`, `Modal(Add/Edit)`, `FormInput`, `TextareaWithCounter`, `ConfirmationModal`, `Toast`
  - UX: keyboard-accessible grid/list, focusable cards, modalne formularze ujęte focus trapem, inkrementalny update siatki.
  - Bezpieczeństwo: potwierdzenie przed usunięciem.

### 2.4 Sesja powtórek

- **Review** (`/review`)
  - Cel: Przeprowadzenie sesji powtórek (SM2)
  - Informacje: jedna fiszka (front), przycisk "Pokaż odpowiedź", ocena ("Znam", "Muszę powtórzyć"), progress bar "X z Y"
  - Komponenty: `CardView`, `Button`, `ProgressBar`, `Spinner`, `Toast`
  - UX: aria-live dla zmian, klawisz Enter/Strzałki do oceniania, informacja po skończeniu.

### 2.5 Ustawienia konta

- **Settings** (`/settings`)
  - Cel: Zmiana hasła, usunięcie konta
  - Informacje: formularz `currentPassword`, `newPassword`, `confirmNewPassword`; przycisk "Delete Account"
  - Komponenty: `FormInput`, `PasswordStrengthIndicator`, `Button`, `ConfirmationModal`, `Toast`
  - UX: ochrona przed przypadkowym usunięciem, walidacja live.

## 3. Mapa podróży użytkownika

**Przykład: Generowanie fiszek AI**

1. Użytkownik niezalogowany próbuje `/generate` → przekierowanie na `/login`
2. Po zalogowaniu redirect do `/generate`
3. Wprowadza tekst (1000–10000 znaków) → live walidacja
4. Klik "Generate" → spinner → fetch POST `/api/generations`
5. Po otrzymaniu kandydatów wyświetla listę `CandidateCard`
6. Użytkownik akceptuje/edytuje/odrzuca poszczególne lub batch Accept All/Selected
7. Klik "Save Selected" → POST `/api/flashcards` → toast sukcesu
8. Redirect lub update `/flashcards`, widzi nowo zapisane karty
9. Rozpoczyna sesję `/review`, ocenia fiszki, kończy sesję → toast lub komunikat końca.

## 4. Układ i struktura nawigacji

- **Layout**:
  - Header z logo i tytułem + Mobile-First Nav
  - NavLinks: Generate, Flashcards, Review, Settings, Logout
  - Active state aria-current
  - AuthPagesLayout: bez Nav, tylko content z powrotem linkiem do logowania/rejestracji
  - Footer minimalny (opcja przyszłego rozbudowania)

## 5. Kluczowe komponenty

- `Layout` / `AuthLayout` – ramka stron
- `FormInput` / `TextareaWithCounter` – kontrolowane pola + live validation
- `PasswordStrengthIndicator` – wskaźnik siły hasła
- `Button` – Primary/Secondary/Danger z accessible props
- `Modal` / `ConfirmationModal` – headless, focus trap, aria-labelledby
- `PaginatedGrid` – accessible grid z paginacją
- `CandidateCard` – karta AI z akcjami
- `Badge` – pokazuje źródło karty
- `ProgressBar` – sesja review
- `Spinner` / `Skeleton` – UI ładowania
- `ToastContainer` / `Toast` – globalny system powiadomień
- `ErrorBoundary` – wychwytywanie krytycznych błędów

_Uwzględnienie przypadków brzegowych:_

- Brak połączenia / timeout → fallback error UI + retry
- 401 → global interceptor → redirect `/login`
- Walidacja długości i formatu → inline error, disabled button
- Puste stany list (flashcards, candidates)
- Ograniczenia znaków (ARIA live messages)

> Wszystkie widoki i komponenty muszą być zgodne z WCAG AA, uwzględniać aria-label, aria-live oraz klawiaturową nawigację.
