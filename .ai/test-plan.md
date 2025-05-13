## Plan Testów dla Projektu Programistycznego "Repetix"

### 1. Wprowadzenie

#### 1.1. Cel planu testów

Celem niniejszego planu testów jest zdefiniowanie strategii, zakresu, zasobów oraz harmonogramu działań testowych dla aplikacji "Repetix". Plan ma na celu zapewnienie wysokiej jakości produktu końcowego poprzez systematyczne wykrywanie i raportowanie błędów na różnych etapach rozwoju aplikacji. Głównym celem jest weryfikacja, czy aplikacja spełnia zdefiniowane wymagania funkcjonalne i niefunkcjonalne, a także czy jest stabilna, użyteczna i bezpieczna dla użytkowników.

#### 1.2. Zakres testów

Testy obejmą następujące obszary funkcjonalne i niefunkcjonalne aplikacji "Repetix":

- **Moduł Uwierzytelniania i Autoryzacji:**
  - Rejestracja nowych użytkowników.
  - Logowanie i wylogowywanie.
  - Proces resetowania hasła.
  - Ochrona tras i zarządzanie sesją użytkownika.
  - Obsługa zdarzeń autentykacji (SSE).
- **Moduł Generowania Fiszek:**
  - Wprowadzanie tekstu źródłowego przez użytkownika.
  - Walidacja danych wejściowych.
  - Komunikacja z usługą AI (OpenRouter) w celu generowania kandydatów na fiszki.
  - Zapisywanie metadanych generacji w bazie danych (Supabase).
  - Obsługa błędów związanych z procesem generacji.
- **Moduł Zarządzania Kandydatami na Fiszki:**
  - Wyświetlanie listy wygenerowanych kandydatów.
  - Akceptowanie, odrzucanie i edycja kandydatów.
  - Walidacja danych podczas edycji fiszek.
- **Moduł Zapisywania Fiszek:**
  - Zapisywanie zaakceptowanych lub wszystkich kandydatów do bazy danych (Supabase).
  - Obsługa błędów związanych z procesem zapisu.
- **Interfejs Użytkownika (UI) i Doświadczenie Użytkownika (UX):**
  - Spójność wizualna i responsywność interfejsu.
  - Nawigacja i użyteczność.
  - Dostępność (a11y).
  - Obsługa powiadomień (Toasts).
- **API Backendowe:**
  - Testowanie endpointów API (`/api/auth/*`, `/api/generations`, `/api/flashcards`).
  - Walidacja schematów żądań i odpowiedzi.
  - Autoryzacja dostępu do endpointów.
- **Integracja z Usługami Zewnętrznymi:**
  - Integracja z Supabase (baza danych, autentykacja).
  - Integracja z OpenRouter.ai (generowanie AI).
- **Aspekty Niefunkcjonalne:**
  - Podstawowe testy wydajnościowe (czas odpowiedzi API).
  - Bezpieczeństwo (ochrona przed podstawowymi atakami, np. XSS, jeśli relevantne, autoryzacja).

**Poza zakresem testów (na tym etapie):**

- Zaawansowane testy wydajnościowe i obciążeniowe.
- Testy penetracyjne.
- Testy użyteczności z udziałem rzeczywistych użytkowników (User Acceptance Testing - UAT), chyba że zostaną zlecone osobno.
- Testy konfiguracji dla bardzo szerokiej gamy przeglądarek i systemów operacyjnych (skupimy się na najpopularniejszych).

### 2. Strategia testowania

#### 2.1. Rodzaje testów

W projekcie "Repetix" zostaną zastosowane następujące rodzaje testów, zgodnie z piramidą testów:

1.  **Testy Jednostkowe (Unit Tests):**

    - **Cel:** Weryfikacja poprawności działania małych, izolowanych fragmentów kodu (funkcje, hooki, logika komponentów React, schematy Zod, metody serwisów z zamockowanymi zależnościami).
    - **Zakres:** Funkcje pomocnicze (`lib/utils.ts`), schematy walidacji (`lib/schemas/*`), logika komponentów UI (`PasswordStrengthMeter`), hooki (`useFlashcardForm`), logika kontekstów (`GenerateFormContext`, `AuthContext`), metody serwisów (`OpenRouterService`, `GenerationService`, `FlashcardsService`) z zamockowanymi zależnościami.
    - **Narzędzia:** Vitest, React Testing Library (RTL).

2.  **Testy Integracyjne (Integration Tests):**

    - **Cel:** Weryfikacja poprawnej współpracy między różnymi komponentami i modułami systemu.
    - **Zakres:**
      - Integracja komponentów React (np. formularz logowania z logiką walidacji i symulowanym wywołaniem API).
      - Integracja komponentów z kontekstami React (np. `GenerateView` z `GenerateFormProvider`).
      - Testowanie API backendowego (`/api/*`) z zamockowanym klientem Supabase i `OpenRouterService`.
      - Testowanie middleware (`src/middleware/index.ts`) z zamockowanym Supabase Auth.
    - **Narzędzia:** Vitest, React Testing Library, Supertest (lub `fetch` z Vitest do testowania API), MSW (Mock Service Worker) do mockowania API.

3.  **Testy End-to-End (E2E Tests):**

    - **Cel:** Symulacja rzeczywistych scenariuszy użytkownika w przeglądarce, testowanie całej aplikacji od interfejsu użytkownika po backend (z zamockowanymi usługami zewnętrznymi tam, gdzie to konieczne).
    - **Zakres:** Kluczowe przepływy użytkownika:
      - Rejestracja i logowanie.
      - Generowanie fiszek (wprowadzenie tekstu, otrzymanie kandydatów).
      - Zarządzanie kandydatami (akceptacja, edycja).
      - Zapisywanie fiszek.
      - Wylogowanie.
      - Ochrona tras.
    - **Narzędzia:** Playwright.

4.  **Testy Wizualne (Visual Regression Tests):**

    - **Cel:** Wykrywanie niezamierzonych zmian w wyglądzie UI.
    - **Zakres:** Kluczowe strony (np. strona główna, strona logowania, strona generowania) oraz wybrane komponenty UI z biblioteki Shadcn/ui w różnych stanach.
    - **Narzędzia:** Playwright z integracją np. z Percy.io lub natywne możliwości snapshotów wizualnych Playwright.

5.  **Testy Dostępności (Accessibility Tests - a11y):**
    - **Cel:** Zapewnienie, że aplikacja jest użyteczna dla osób z niepełnosprawnościami, zgodnie ze standardami WCAG.
    - **Zakres:** Automatyczne skanowanie kluczowych stron i formularzy pod kątem naruszeń WCAG. Podstawowa weryfikacja nawigacji klawiaturą.
    - **Narzędzia:** Axe-core zintegrowane z Playwright.

#### 2.2. Priorytety testowe

Priorytetyzacja testów będzie oparta na krytyczności biznesowej funkcjonalności, ryzyku związanym z potencjalnymi błędami, złożoności modułów oraz częstotliwości ich użycia.

1.  **Priorytet Krytyczny:**

    - Pełny cykl uwierzytelniania (rejestracja, logowanie, wylogowanie, reset hasła).
    - Ochrona tras i zarządzanie sesją.
    - Główny przepływ generowania fiszek (wprowadzenie tekstu -> interakcja z AI -> wyświetlenie kandydatów).
    - Zapisywanie utworzonych/zaakceptowanych fiszek do bazy danych.
    - Kluczowe API endpoints (`/api/auth/*`, `/api/generations`, `/api/flashcards`).
    - Middleware (`src/middleware/index.ts`).

2.  **Priorytet Wysoki:**

    - Walidacja wszystkich formularzy wejściowych (po stronie klienta i serwera).
    - Mechanizmy obsługi błędów (z API, z usług zewnętrznych) i ich komunikacja użytkownikowi.
    - Logika zarządzania stanem w kontekstach React (`AuthContext`, `GenerateFormContext`).
    - Interakcje z kandydatami na fiszki (akceptacja, odrzucenie, edycja).

3.  **Priorytet Średni:**

    - Spójność wizualna i responsywność podstawowych komponentów UI i layoutów.
    - Nawigacja w aplikacji.
    - Podstawowe testy dostępności.

4.  **Priorytet Niski:**
    - Mniej krytyczne komponenty UI, strony o niskiej interaktywności (np. `Welcome.astro`).
    - Komponenty pomocnicze (np. szkielety ładowania).

#### 2.3. Narzędzia i technologie do wykorzystania w testach

- **Framework do testów jednostkowych i integracyjnych:** Vitest
- **Biblioteka do testowania komponentów React:** React Testing Library (RTL)
- **Framework do testów E2E:** Playwright
- **Mockowanie API/serwisów:** MSW (Mock Service Worker), Vitest Mocks (`vi.mock`)
- **Testowanie API:** Supertest (dla testów integracyjnych API), Playwright (dla E2E obejmujących API)
- **Testy dostępności:** Axe-core (zintegrowane z Playwright)
- **Testy wizualne:** Playwright (z ewentualną integracją z Percy.io lub podobnym)
- **CI/CD:** GitHub Actions (do automatycznego uruchamiania testów)
- **Śledzenie błędów:** GitHub Issues (lub dedykowane narzędzie np. Jira, jeśli dostępne)
- **Zarządzanie kodem źródłowym:** Git, GitHub

### 3. Środowisko testowe

#### 3.1. Wymagania sprzętowe i programowe

- **Maszyny deweloperskie/testerskie:** Standardowy komputer z systemem operacyjnym (Windows, macOS, Linux) umożliwiającym uruchomienie Node.js, przeglądarek (Chrome, Firefox, Edge) oraz narzędzi deweloperskich.
- **Serwer CI:** Zgodny z wymaganiami GitHub Actions, z dostępem do Node.js, przeglądarek (headless).
- **Przeglądarki:**
  - Główne: Chrome (najnowsza wersja)
  - Dodatkowe (dla testów kompatybilności E2E): Firefox (najnowsza wersja), Edge (najnowsza wersja).
- **Node.js:** Wersja LTS (zgodna z projektem).
- **Dostęp do Internetu:** Wymagany do pobierania zależności i potencjalnie do interakcji z usługami (choć większość będzie mockowana).

#### 3.2. Konfiguracja środowiska

- **Środowisko lokalne:** Deweloperzy i testerzy konfigurują środowisko zgodnie z dokumentacją projektu (instalacja zależności `npm install`, konfiguracja zmiennych środowiskowych `.env`).
- **Środowisko CI (GitHub Actions):**
  - Workflowy zdefiniowane w `.github/workflows/`.
  - Instalacja Node.js, zależności projektu.
  - Konfiguracja zmiennych środowiskowych (np. `SUPABASE_URL`, `SUPABASE_KEY`, `OPENROUTER_API_KEY` – używając GitHub Secrets, dla testów mogą to być klucze testowe lub mockowane wartości).
  - Uruchamianie różnych typów testów w osobnych jobach lub krokach.
- **Baza danych testowa (Supabase):**
  - Rekomendowane jest użycie osobnej, dedykowanej instancji Supabase do celów testowych, aby uniknąć konfliktów z danymi deweloperskimi lub produkcyjnymi.
  - Alternatywnie, jeśli Supabase wspiera, użycie schematów lub prefiksów dla tabel testowych.
  - Mechanizmy seedowania danych testowych i czyszczenia bazy po testach (skrypty SQL, funkcje pomocnicze w testach).
- **Mockowanie usług zewnętrznych:**
  - **OpenRouter.ai:** Użycie MSW lub `vi.mock` do mockowania odpowiedzi z API OpenRouter, aby testy były deterministyczne i nie generowały kosztów.
  - **Supabase:** Dla testów jednostkowych i niektórych integracyjnych serwisów, klient Supabase będzie mockowany. Dla testów API i E2E, interakcja z testową instancją Supabase.

### 4. Przypadki testowe

Poniżej przedstawiono listę wysokopoziomowych przypadków testowych dla kluczowych funkcjonalności. Szczegółowe przypadki testowe (kroki, oczekiwane rezultaty) zostaną opracowane w dedykowanym systemie zarządzania testami lub dokumentacji.

**Moduł Uwierzytelniania i Autoryzacji:**

- `TC_AUTH_001`: Pomyślna rejestracja nowego użytkownika z poprawnymi danymi.
- `TC_AUTH_002`: Próba rejestracji z istniejącym adresem email.
- `TC_AUTH_003`: Walidacja pól formularza rejestracji (pusty email, niepoprawny format email, krótkie hasło, niepasujące hasła).
- `TC_AUTH_004`: Pomyślne logowanie z poprawnymi danymi.
- `TC_AUTH_005`: Próba logowania z niepoprawnym hasłem/emailem.
- `TC_AUTH_006`: Walidacja pól formularza logowania.
- `TC_AUTH_007`: Pomyślne wylogowanie użytkownika.
- `TC_AUTH_008`: Dostęp do chronionej strony (`/generate`) przez niezalogowanego użytkownika (oczekiwane przekierowanie na `/login`).
- `TC_AUTH_009`: Dostęp do strony logowania (`/login`) przez zalogowanego użytkownika (oczekiwane przekierowanie na `/`).
- `TC_AUTH_010`: Proces żądania resetu hasła (wprowadzenie emaila, komunikat o wysłaniu linku).
- `TC_AUTH_011`: Proces ustawiania nowego hasła przy użyciu tokenu z linku (walidacja nowego hasła).

**Moduł Generowania Fiszek:**

- `TC_GEN_001`: Pomyślne wygenerowanie kandydatów na fiszki po wprowadzeniu poprawnego tekstu (1000-10000 znaków).
- `TC_GEN_002`: Walidacja pola tekstowego (tekst za krótki, tekst za długi).
- `TC_GEN_003`: Wyświetlenie komunikatu o błędzie w przypadku problemu z API generowania (np. błąd OpenRouter).
- `TC_GEN_004`: Stan ładowania podczas generowania fiszek (np. przycisk "Generating...", szkielet listy).
- `TC_GEN_005`: Zapis metadanych generacji w tabeli `generations` (test integracyjny API).

**Moduł Zarządzania Kandydatami na Fiszki:**

- `TC_CAND_001`: Akceptacja kandydata na fiszkę (wizualne oznaczenie, aktualizacja stanu).
- `TC_CAND_002`: Odrzucenie (usunięcie akceptacji) kandydata na fiszkę.
- `TC_CAND_003`: Otwarcie modala edycji dla kandydata.
- `TC_CAND_004`: Edycja tekstu front/back kandydata w modalu i zapisanie zmian.
- `TC_CAND_005`: Walidacja pól w modalu edycji (puste pola, przekroczenie limitu znaków).
- `TC_CAND_006`: Anulowanie edycji kandydata.
- `TC_CAND_007`: Oznaczenie edytowanego kandydata jako `isEdited`.

**Moduł Zapisywania Fiszek:**

- `TC_SAVE_001`: Zapisanie wszystkich zaakceptowanych kandydatów.
- `TC_SAVE_002`: Zapisanie wszystkich wygenerowanych kandydatów.
- `TC_SAVE_003`: Wyświetlenie komunikatu o sukcesie po zapisaniu fiszek.
- `TC_SAVE_004`: Wyczyszczenie listy kandydatów i formularza po pomyślnym zapisie.
- `TC_SAVE_005`: Wyświetlenie komunikatu o błędzie w przypadku problemu z API zapisu fiszek.
- `TC_SAVE_006`: Zapis fiszek w tabeli `flashcards` z poprawnym `user_id`, `generation_id`, `source` (test integracyjny API).

**API Endpoints:**

- `TC_API_GEN_001 (POST /api/generations)`: Poprawne żądanie z autoryzacją - odpowiedź 201 i dane generacji.
- `TC_API_GEN_002 (POST /api/generations)`: Żądanie bez autoryzacji - odpowiedź 401.
- `TC_API_GEN_003 (POST /api/generations)`: Żądanie z niepoprawnym payloadem - odpowiedź 400.
- `TC_API_FLASH_001 (POST /api/flashcards)`: Poprawne żądanie z autoryzacją - odpowiedź 201 i zapisane fiszki.
- `TC_API_FLASH_002 (POST /api/flashcards)`: Żądanie bez autoryzacji - odpowiedź 401.
- `TC_API_FLASH_003 (POST /api/flashcards)`: Żądanie z niepoprawnym payloadem (np. zła struktura `cards`) - odpowiedź 400.
- `TC_API_AUTH_LOGIN_001 (POST /api/auth/login)`: Poprawne dane logowania - odpowiedź 200 i dane użytkownika.
- `TC_API_AUTH_REG_001 (POST /api/auth/register)`: Poprawne dane rejestracji - odpowiedź 200 i komunikat.
- (Podobne przypadki dla pozostałych endpointów API auth)

### 5. Harmonogram i zasoby

#### 5.1. Przybliżony harmonogram wykonania testów

Harmonogram testów będzie ściśle powiązany z harmonogramem deweloperskim (sprintami, jeśli projekt jest prowadzony w metodyce Agile). Testy powinny być wykonywane iteracyjnie.

- **Faza 1 (Setup i testy podstawowe):**
  - Konfiguracja narzędzi testowych i środowiska CI (1-2 tygodnie od rozpoczęcia projektu).
  - Pisanie testów jednostkowych i integracyjnych dla kluczowych serwisów i schematów (równolegle z developmentem).
  - Pierwsze testy E2E dla przepływu logowania i rejestracji (po implementacji tych funkcjonalności).
- **Faza 2 (Testowanie głównych funkcjonalności):**
  - Intensywne testowanie modułu generowania fiszek, zarządzania kandydatami i zapisywania (równolegle z developmentem tych modułów).
  - Rozbudowa zestawu testów E2E o te przepływy.
  - Wprowadzenie testów wizualnych i dostępności dla kluczowych komponentów/stron.
- **Faza 3 (Stabilizacja i testy regresji):**
  - Przed każdym większym wydaniem, pełne wykonanie wszystkich testów (jednostkowych, integracyjnych, E2E).
  - Testy regresji w celu upewnienia się, że nowe zmiany nie zepsuły istniejących funkcjonalności.
  - Testy eksploracyjne w celu znalezienia nieoczywistych błędów.
- **Ciągłe testowanie:**
  - Testy jednostkowe i integracyjne uruchamiane automatycznie przy każdym pushu do repozytorium.
  - Testy E2E uruchamiane regularnie (np. co noc) lub przed każdym mergem do głównej gałęzi.

Dokładny harmonogram będzie zależał od postępów prac deweloperskich.

#### 5.2. Potrzebne zasoby

- **Ludzkie:**
  - Inżynier QA (odpowiedzialny za planowanie, projektowanie, wykonywanie testów, automatyzację, raportowanie).
  - Deweloperzy (odpowiedzialni za pisanie testów jednostkowych, wsparcie w debugowaniu, naprawę błędów).
- **Sprzętowe/Programowe:**
  - Dostęp do repozytorium kodu (GitHub).
  - Narzędzia wymienione w sekcji 2.3.
  - Dostęp do testowej instancji Supabase.
  - Ewentualne licencje na płatne narzędzia (np. Percy.io, jeśli zostanie wybrane).
  - Zasoby CI/CD (GitHub Actions).

### 6. Raportowanie i śledzenie błędów

#### 6.1. Proces raportowania błędów

1.  **Identyfikacja błędu:** Błąd jest wykrywany podczas wykonywania testów (manualnych lub automatycznych) lub zgłaszany przez dewelopera/użytkownika.
2.  **Reprodukcja błędu:** Tester próbuje odtworzyć błąd, aby potwierdzić jego istnienie i zrozumieć warunki występowania.
3.  **Dokumentacja błędu:** Każdy znaleziony błąd zostanie zaraportowany w systemie śledzenia błędów (np. GitHub Issues). Raport powinien zawierać:
    - Unikalny identyfikator (automatycznie nadawany przez system).
    - Tytuł: Krótki, zwięzły opis problemu.
    - Opis: Szczegółowy opis błędu.
    - Kroki do reprodukcji: Jasna lista kroków potrzebnych do odtworzenia błędu.
    - Oczekiwany rezultat: Jak system powinien się zachować.
    - Rzeczywisty rezultat: Jak system się zachował.
    - Środowisko: Wersja aplikacji, przeglądarka, system operacyjny, na którym błąd wystąpił.
    - Priorytet/Ważność (Severity/Priority): Określone przez testera, np. Krytyczny, Wysoki, Średni, Niski.
    - Załączniki: Zrzuty ekranu, nagrania wideo, logi, które mogą pomóc w diagnozie.
4.  **Przypisanie błędu:** Błąd jest przypisywany do odpowiedniego dewelopera do naprawy.
5.  **Naprawa błędu:** Deweloper analizuje błąd, naprawia go i oznacza jako naprawiony.
6.  **Weryfikacja poprawki:** Tester ponownie testuje zgłoszony błąd na nowej wersji aplikacji, aby potwierdzić, że został on poprawnie naprawiony.
7.  **Zamknięcie błędu:** Jeśli błąd został naprawiony, tester zamyka zgłoszenie. Jeśli nie, zgłoszenie jest ponownie otwierane z odpowiednim komentarzem.

#### 6.2. Narzędzia do śledzenia błędów

- **GitHub Issues:** Zintegrowane z repozytorium, umożliwia łatwe powiązanie błędów z commitami i pull requestami. Etykiety (`bug`, `critical`, `high`, `medium`, `low`, `enhancement`) i kamienie milowe (milestones) mogą być używane do organizacji.

### 7. Kryteria akceptacji i zakończenia testów

#### 7.1. Kryteria wejścia (rozpoczęcia testów dla danej funkcjonalności/wydania)

- Kod źródłowy funkcjonalności jest dostępny i skompilowany/zbudowany.
- Środowisko testowe jest skonfigurowane i dostępne.
- Podstawowe testy dymne (smoke tests) przechodzą pomyślnie.
- Dokumentacja wymagań (jeśli istnieje) jest dostępna.
- Wszystkie zależności (np. usługi zewnętrzne) są dostępne lub odpowiednio zamockowane.

#### 7.2. Kryteria wyjścia (zakończenia testów dla danej fazy/wydania)

- Wszystkie zaplanowane przypadki testowe zostały wykonane.
- Określony procent przypadków testowych zakończył się sukcesem (np. 95% dla krytycznych i wysokich priorytetów, 90% ogólnie).
- Pokrycie kodu testami jednostkowymi osiągnęło zdefiniowany próg (np. 80%).
- Wszystkie błędy o priorytecie Krytycznym i Wysokim zostały naprawione i zweryfikowane.
- Liczba otwartych błędów o priorytecie Średnim i Niskim jest akceptowalna dla zespołu projektowego/produktu.
- Raport z testów został przygotowany i zaakceptowany.

#### 7.3. Kryteria zawieszenia i wznowienia testów

- **Kryteria zawieszenia:**
  - Wystąpienie krytycznego błędu blokującego dalsze testowanie większości funkcjonalności.
  - Niedostępność środowiska testowego lub kluczowych zależności.
  - Znaczące zmiany w wymaganiach, które czynią istniejące przypadki testowe nieaktualnymi.
- **Kryteria wznowienia:**
  - Błąd blokujący został naprawiony i zweryfikowany.
  - Środowisko testowe/zależności są ponownie dostępne.
  - Przypadki testowe zostały zaktualizowane zgodnie ze zmienionymi wymaganiami.

Niniejszy plan testów będzie dokumentem żywym i może być aktualizowany w miarę postępu projektu i pojawiania się nowych informacji lub zmian w wymaganiach.
