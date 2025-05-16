# Plan implementacji widoku Landing Page

## 1. Przegląd

Landing page (strona główna) ma na celu przedstawienie aplikacji Repetix nowym użytkownikom. Powinna jasno komunikować główne korzyści produktu, takie jak generowanie fiszek za pomocą AI, ręczne zarządzanie fiszkami oraz nauka metodą spaced repetition. Strona ma zachęcić użytkowników do rejestracji lub zalogowania się oraz być estetyczna i zgodna z WCAG AA.

## 2. Routing widoku

Widok będzie dostępny pod główną ścieżką aplikacji: `/`

## 3. Struktura komponentów

Strona będzie zbudowana jako strona Astro (`src/pages/index.astro`), wykorzystując layout Astro oraz komponenty Astro dla sekcji statycznych. Komponenty interaktywne (np. przyciski z Shadcn/ui, jeśli wymagają JS) mogą być implementowane jako komponenty React (`.tsx`) osadzone za pomocą Astro Islands.

```
src/pages/index.astro
└── LandingLayout.astro (`src/layouts/LandingLayout.astro`)
    ├── HeaderComponent (Komponent Astro/React: `src/components/landing/HeaderComponent.astro` lub `.tsx`)
    │   ├── AppLogo (np. SVG lub komponent Astro: `src/components/common/AppLogo.astro`)
    │   ├── NavLinks (Lista linków, może być częścią HeaderComponent)
    │   └── UserActions (Przyciski Logowania/Rejestracji, np. wykorzystujące `Button` z Shadcn/ui)
    ├── main (główna treść strony w slocie layoutu)
    │   ├── HeroSection (Komponent Astro: `src/components/landing/HeroSection.astro`)
    │   │   └── PrimaryCTAButton (np. `Button` z Shadcn/ui)
    │   ├── FeaturesSection (Komponent Astro: `src/components/landing/FeaturesSection.astro`)
    │   │   └── FeatureCard (Komponent Astro, powtarzalny: `src/components/landing/FeatureCard.astro`)
    │   ├── HowItWorksSection (Opcjonalnie, Komponent Astro: `src/components/landing/HowItWorksSection.astro`)
    │   │   └── StepItem (Komponent Astro, powtarzalny: `src/components/landing/StepItem.astro`)
    │   ├── CallToActionSection (Komponent Astro: `src/components/landing/CallToActionSection.astro`)
    │   │   └── SecondaryCTAButton (np. `Button` z Shadcn/ui)
    └── FooterComponent (Komponent Astro: `src/components/landing/FooterComponent.astro`)
        └── FooterLinks (Lista linków, może być częścią FooterComponent)
```

## 4. Szczegóły komponentów

### `LandingLayout.astro`

- **Opis komponentu:** Główny layout strony lądowania. Definiuje ogólną strukturę strony, w tym nagłówek, stopkę oraz miejsce na główną treść (`<slot />`).
- **Główne elementy HTML:** `<header>`, `<main>`, `<footer>`, `<slot />`. Wykorzystuje `HeaderComponent` i `FooterComponent`.
- **Obsługiwane interakcje:** Brak bezpośrednich.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Standardowe propy Astro.
- **Propsy:** `title` (string, dla `<title>` strony).

### `HeaderComponent` (Astro/React)

- **Opis komponentu:** Nagłówek strony, zawierający logo, linki nawigacyjne oraz przyciski akcji (Logowanie, Rejestracja).
- **Główne elementy:** Logo aplikacji, lista linków (`ul > li > a`), przyciski (np. `<Button variant="outline">Zaloguj się</Button>`, `<Button>Zarejestruj się</Button>` z `shadcn/ui`).
- **Obsługiwane interakcje:** Kliknięcie logo (nawigacja do `/`), kliknięcie linków nawigacyjnych (nawigacja do odpowiednich sekcji strony lub innych stron), kliknięcie przycisków Logowanie/Rejestracja (nawigacja do `/login`, `/signup`).
- **Obsługiwana walidacja:** Brak.
- **Typy:**
  ```typescript
  interface NavLinkItem {
    href: string;
    text: string;
  }
  ```
- **Propsy:** `navLinks: NavLinkItem[]` (opcjonalne, jeśli linki są dynamiczne).

### `HeroSection.astro`

- **Opis komponentu:** Pierwsza, główna sekcja strony. Zawiera chwytliwy nagłówek (H1), krótki opis wartości Repetix oraz główny przycisk Call to Action (CTA). Może zawierać grafikę/ilustrację.
- **Główne elementy:** `<h1>`, `<p>`, przycisk CTA (np. `<Button size="lg">Rozpocznij za darmo</Button>`).
- **Obsługiwane interakcje:** Kliknięcie przycisku CTA (nawigacja do `/signup` lub innej strony startowej).
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak specyficznych.
- **Propsy:** `headline: string`, `subheadline: string`, `ctaText: string`, `ctaLink: string`, `imageUrl?: string`.

### `FeaturesSection.astro`

- **Opis komponentu:** Sekcja prezentująca kluczowe funkcje aplikacji (np. generowanie AI, manualne tworzenie, nauka z SM2). Zwykle składa się z kilku `FeatureCard`.
- **Główne elementy:** Nagłówek sekcji (np. `<h2>`), kontener (np. flexbox/grid) dla `FeatureCard`.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:**
  ```typescript
  interface FeatureItemProps {
    icon?: string; // Nazwa klasy dla ikony SVG lub ścieżka
    title: string;
    description: string;
  }
  ```
- **Propsy:** `features: FeatureItemProps[]`.

### `FeatureCard.astro`

- **Opis komponentu:** Pojedyncza karta opisująca jedną funkcję. Zawiera ikonę (opcjonalnie), tytuł i krótki opis.
- **Główne elementy:** Kontener karty, element na ikonę (`<img>` lub SVG), `<h3>` dla tytułu, `<p>` dla opisu.
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `FeatureItemProps` (jak wyżej).
- **Propsy:** `icon?: string`, `title: string`, `description: string`.

### `HowItWorksSection.astro` (Opcjonalnie)

- **Opis komponentu:** Sekcja wyjaśniająca w prostych krokach, jak korzystać z aplikacji.
- **Główne elementy:** Nagłówek sekcji, lista kroków (`StepItem`).
- **Obsługiwane interakcje:** Brak.
- **Obsługiwana walidacja:** Brak.
- **Typy:**
  ```typescript
  interface HowItWorksStepProps {
    stepNumber: number;
    title: string;
    description: string;
  }
  ```
- **Propsy:** `steps: HowItWorksStepProps[]`.

### `CallToActionSection.astro`

- **Opis komponentu:** Sekcja na końcu strony, ponownie zachęcająca do działania (np. rejestracji).
- **Główne elementy:** Nagłówek, tekst zachęty, przycisk CTA.
- **Obsługiwane interakcje:** Kliknięcie przycisku CTA.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak specyficznych.
- **Propsy:** `headline: string`, `text: string`, `ctaText: string`, `ctaLink: string`.

### `FooterComponent.astro`

- **Opis komponentu:** Stopka strony. Zawiera informacje o prawach autorskich, linki do polityki prywatności, regulaminu itp.
- **Główne elementy:** Tekst copyright, lista linków.
- **Obsługiwane interakcje:** Kliknięcie linków.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `NavLinkItem[]` (jak w HeaderComponent).
- **Propsy:** `footerLinks: NavLinkItem[]`.

## 5. Typy

Główne typy potrzebne do implementacji widoku to proste interfejsy dla propsów komponentów, definiujące strukturę danych dla elementów takich jak linki nawigacyjne, cechy produktu czy kroki w sekcji "Jak to działa".

```typescript
// Plik: src/types/landing.types.ts (lub zdefiniowane wewnątrz komponentów Astro)

export interface NavLinkItem {
  href: string;
  text: string;
  isExternal?: boolean; // Czy link prowadzi poza aplikację
}

export interface FeatureItemProps {
  icon?: string; // Sugestia: ścieżka do pliku SVG lub nazwa ikony z biblioteki
  title: string;
  description: string;
}

export interface HowItWorksStepProps {
  stepNumber: string; // Może być stringiem np. "Krok 1"
  title: string;
  description: string;
  imageUrl?: string; // Opcjonalna grafika dla kroku
}
```

Typy z `src/types.ts` (np. `FlashcardRow`, `GenerationRow`) nie są bezpośrednio używane na statycznym landing page'u.

## 6. Zarządzanie stanem

Landing page będzie w większości statyczny, więc zapotrzebowanie na zarządzanie stanem po stronie klienta będzie minimalne.

- **Lokalny stan komponentów React:** Jeśli `HeaderComponent` (lub jego część, np. menu mobilne) zostanie zaimplementowany w React, będzie zarządzał swoim lokalnym stanem (np. `isMobileMenuOpen: boolean`).
- **Brak globalnego stanu:** Nie przewiduje się potrzeby globalnego zarządzania stanem (np. Zustand, Redux) specyficznie dla landing page'a. Ewentualny stan zalogowania użytkownika (do dynamicznego wyświetlania linków w nagłówku) byłby zarządzany globalnie przez aplikację i odczytywany przez `HeaderComponent`.
- **Custom hooks:** Nie przewiduje się potrzeby tworzenia niestandardowych hooków dla tej strony w jej początkowej wersji.

## 7. Integracja API

Landing page nie będzie bezpośrednio integrował się z żadnym API w celu pobierania swojej treści. Wszystkie treści będą statyczne lub przekazywane przez propsy do komponentów.

- Przyciski "Zaloguj się" i "Zarejestruj się" będą jedynie nawigować do odpowiednich stron (`/login`, `/signup`), które są odpowiedzialne za interakcję z API autentykacji.

## 8. Interakcje użytkownika

- **Nawigacja:** Kliknięcie na logo, linki w nagłówku/stopce, oraz przyciski CTA będzie skutkować przejściem do odpowiednich stron (np. `/login`, `/signup`) lub sekcji na stronie (jeśli używane są kotwice).
- **Hover/Focus:** Standardowe wizualne informacje zwrotne dla linków i przycisków (zmiana stylu).
- **Responsywność:** Układ strony dostosowuje się do różnych rozmiarów ekranu. Menu nawigacyjne w nagłówku może zmieniać się w tzw. "hamburger menu" na mniejszych ekranach.

## 9. Warunki i walidacja

- **Dostępność (WCAG AA):** Najważniejsza "walidacja".
  - Wszystkie interaktywne elementy (linki, przyciski) muszą być dostępne z klawiatury.
  - Odpowiedni kontrast kolorów.
  - Semantyczny HTML (`<nav>`, `<main>`, `<article>`, `<aside>`, `<h1>`-`<h6>` itp.).
  - Atrybuty ARIA tam, gdzie to konieczne (np. dla menu mobilnego).
  - Alternatywne teksty dla obrazów (`alt`).
- **Walidacja formularzy:** Nie dotyczy, ponieważ landing page nie zawiera formularzy przesyłających dane.

## 10. Obsługa błędów

Ponieważ strona jest głównie statyczna, główne potencjalne "błędy" to:

- **Niewczytane zasoby (obrazy, ikony):**
  - Zapewnienie `alt` tekstów dla obrazów.
  - Użycie placeholderów lub domyślnych stylów, jeśli ikony SVG nie mogą być załadowane.
- **Niedziałające linki:** Staranne testowanie wszystkich linków.
- **Problemy z JavaScript (jeśli używane są komponenty React):**
  - Astro zapewnia, że strona działa bez JS. Komponenty React powinny być używane progresywnie. Krytyczne funkcje (jak nawigacja CTA) powinny działać jako zwykłe linki (`<a>`), które mogą być ostylowane jak przyciski.

## 11. Kroki implementacji

1.  **Stworzenie struktury plików i katalogów:**
    - Utworzenie `src/pages/index.astro`.
    - Utworzenie layoutu `src/layouts/LandingLayout.astro`.
    - Utworzenie katalogu `src/components/landing/` na komponenty specyficzne dla landing page'a.
    - Utworzenie `src/types/landing.types.ts` (jeśli typy nie są inline w komponentach).
2.  **Implementacja `LandingLayout.astro`:**
    - Podstawowa struktura HTML (head, body, header, main, footer).
    - Dodanie slotu na treść strony.
    - Podlinkowanie globalnych stylów Tailwind i ewentualnych dodatkowych stylów.
3.  **Implementacja `HeaderComponent`:**
    - Dodanie logo aplikacji.
    - Implementacja linków nawigacyjnych (początkowo mogą być statyczne).
    - Dodanie przycisków "Zaloguj się" i "Zarejestruj się" (np. z Shadcn/ui, jako linki `<a>` ostylowane jak przyciski).
    - Zapewnienie responsywności (np. menu mobilne).
4.  **Implementacja `FooterComponent`:**
    - Dodanie informacji o prawach autorskich.
    - Dodanie linków (np. Polityka Prywatności, Regulamin).
5.  **Implementacja `HeroSection.astro`:**
    - Dodanie nagłówka H1, tekstu wprowadzającego.
    - Dodanie głównego przycisku CTA.
    - Opcjonalnie: dodanie grafiki/tła.
6.  **Implementacja `FeaturesSection.astro` i `FeatureCard.astro`:**
    - Zdefiniowanie danych dla cech (tytuły, opisy, ikony).
    - Stworzenie komponentu `FeatureCard.astro` do wyświetlania pojedynczej cechy.
    - Użycie `FeatureCard` w `FeaturesSection.astro` do wyświetlenia listy cech w responsywnym układzie (np. grid).
7.  **(Opcjonalnie) Implementacja `HowItWorksSection.astro` i `StepItem.astro`:**
    - Analogicznie do sekcji cech, zdefiniowanie kroków i ich prezentacja.
8.  **Implementacja `CallToActionSection.astro`:**
    - Dodanie nagłówka, tekstu i przycisku CTA.
9.  **Stylowanie i Responsywność:**
    - Użycie Tailwind CSS do stylowania wszystkich komponentów.
    - Zapewnienie, że strona jest w pełni responsywna na różnych urządzeniach (desktop, tablet, mobile).
10. **Dostępność (WCAG AA):**
    - Przegląd semantyki HTML.
    - Testowanie kontrastu kolorów.
    - Testowanie nawigacji klawiaturą.
    - Dodanie atrybutów ARIA w razie potrzeby.
    - Testowanie za pomocą narzędzi (np. Axe DevTools).
11. **Testowanie:**
    - Manualne przeklikanie strony na różnych przeglądarkach i urządzeniach.
    - Weryfikacja wszystkich linków i interakcji.
12. **Optymalizacja:**
    - Optymalizacja obrazów (format, kompresja).
    - Weryfikacja wydajności (np. Lighthouse).
