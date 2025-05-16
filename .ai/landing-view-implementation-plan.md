# Plan implementacji widoku Landing Page

## 1. Przegląd

Landing page (strona główna) ma na celu przedstawienie aplikacji Repetix nowym użytkownikom. Powinna jasno komunikować główne korzyści produktu, takie jak generowanie fiszek za pomocą AI, ręczne zarządzanie fiszkami oraz nauka metodą spaced repetition. Strona ma zachęcić użytkowników do rejestracji lub zalogowania się oraz być estetyczna i zgodna z WCAG AA.

## 2. Routing widoku

Widok jest dostępny pod główną ścieżką aplikacji: `/`

## 3. Struktura komponentów

Strona jest zbudowana jako strona Astro (`src/pages/index.astro`), wykorzystując istniejący layout (`Layout.astro`) oraz komponenty Astro dla sekcji statycznych. Komponenty interaktywne (np. Link z Shadcn/ui) są implementowane jako komponenty React osadzone za pomocą Astro Islands.

```
src/pages/index.astro
└── Layout.astro (`src/layouts/Layout.astro`)
    ├── Navigation (Istniejący komponent nawigacji)
    ├── main (główna treść strony w slocie layoutu)
    │   ├── Welcome (Komponent Astro: `src/components/Welcome.astro`)
    │   │   └── Link (z Shadcn/ui dla przycisków CTA)
    │   ├── FeaturesSection (Komponent Astro: `src/components/landing/FeaturesSection.astro`)
    │   └── CallToActionSection (Komponent Astro: `src/components/landing/CallToActionSection.astro`)
    │       └── Link (z Shadcn/ui dla przycisku CTA)
```

## 4. Szczegóły komponentów

### `Welcome.astro`

- **Opis komponentu:** Sekcja hero strony lądowania. Zawiera chwytliwy nagłówek (H1), krótki opis wartości Repetix oraz główne przyciski Call to Action (CTA).
- **Główne elementy:** Gradient tła, nagłówek, opis, lista kluczowych cech, przyciski CTA.
- **Obsługiwane interakcje:** Kliknięcie przycisków CTA (nawigacja do `/signup` lub `#features`).
- **Typy:** Brak specyficznych.

### `FeaturesSection.astro`

- **Opis komponentu:** Sekcja prezentująca 4 kluczowe funkcje aplikacji (generowanie AI, nauka z SM2, manualne tworzenie, śledzenie postępów).
- **Główne elementy:** Nagłówek sekcji, grid z kartami funkcji.
- **Obsługiwane interakcje:** Brak.
- **Typy:**
  ```typescript
  interface Feature {
    title: string;
    description: string;
    icon: string;
  }
  ```

### `CallToActionSection.astro`

- **Opis komponentu:** Sekcja końcowa zachęcająca do rejestracji, z gradientem tła podobnym do sekcji hero.
- **Główne elementy:** Nagłówek, tekst zachęty, przycisk CTA.
- **Obsługiwane interakcje:** Kliknięcie przycisku CTA (nawigacja do `/signup`).
- **Typy:** Brak specyficznych.

## 5. Typy

Główne typy są proste i zdefiniowane wewnątrz komponentów. Jedynym współdzielonym typem jest `Feature` dla sekcji funkcji.

## 6. Zarządzanie stanem

Landing page jest w pełni statyczny, nie wymaga zarządzania stanem po stronie klienta.

## 7. Integracja API

Landing page nie integruje się z żadnym API. Wszystkie treści są statyczne.

## 8. Interakcje użytkownika

- **Nawigacja:** Kliknięcie przycisków CTA nawiguje do `/signup` lub sekcji `#features`.
- **Hover/Focus:** Standardowe wizualne informacje zwrotne dla przycisków.
- **Responsywność:** Układ strony dostosowuje się do różnych rozmiarów ekranu.

## 9. Warunki i walidacja

- **Dostępność (WCAG AA):**
  - Wszystkie interaktywne elementy dostępne z klawiatury.
  - Odpowiedni kontrast kolorów w gradientach.
  - Semantyczny HTML.
  - Alternatywne teksty dla ikon.

## 10. Obsługa błędów

Strona jest statyczna, nie wymaga specjalnej obsługi błędów.

## 11. Status implementacji

✅ Zrealizowane:

- Podstawowa struktura strony z Layout.astro
- Sekcja hero (Welcome.astro) z gradientem i przyciskami CTA
- Sekcja funkcji (FeaturesSection.astro) z 4 kluczowymi cechami
- Sekcja CTA (CallToActionSection.astro) z wezwaniem do działania
- Integracja komponentu Link z Shadcn/ui
- Responsywny układ wszystkich sekcji

🔄 W toku:

- Optymalizacja kontrastów dla WCAG AA
- Dopracowanie responsywności na różnych urządzeniach
- Testowanie nawigacji i interakcji

## 12. Następne kroki

1. Przeprowadzenie testów dostępności
2. Optymalizacja wydajności (Lighthouse)
3. Testy na różnych przeglądarkach i urządzeniach
