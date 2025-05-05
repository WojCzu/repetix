# Status implementacji widoku Generate

## Zrealizowane kroki

1. Utworzenie strony Astro (`/generate`)

   - Podstawowy layout z tytułem
   - Osadzenie GenerateView jako client-side island
   - Dodanie Toaster do layoutu dla powiadomień

2. Implementacja GenerateView

   - Podstawowa struktura komponentu
   - Zarządzanie stanem (inputText, validation, generation, candidates)
   - Integracja z API `/api/generations`
   - Obsługa błędów i powiadomień
   - Przygotowanie handlerów dla akcji na kartach

3. Implementacja TextInputSection

   - Walidacja tekstu z użyciem zod
   - Uproszczony placeholder
   - Bezpośrednie użycie Textarea z shadcn
   - Obsługa stanu ładowania

4. Implementacja CandidateListSection

   - Wydzielenie CardListSkeleton do osobnego komponentu
   - Implementacja BatchActionBar
   - Implementacja CandidateCard
   - Responsywny układ kart (2 kolumny na SM, 3 na LG)

5. Implementacja komponentów pomocniczych
   - SourceBadge dla oznaczania źródła fiszki
   - CardListSkeleton dla stanu ładowania
   - Integracja z komponentami shadcn (Button, Card, Badge, Textarea)

## Kolejne kroki

1. Implementacja EditFlashcardModal

   - Dialog do edycji treści fiszki
   - Walidacja długości pól (front ≤200, back ≤500)
   - Obsługa zapisywania zmian
   - Aktualizacja stanu isEdited

2. Integracja z API `/api/flashcards`

   - Implementacja handleSaveAll
   - Implementacja handleSaveAccepted
   - Obsługa stanu zapisywania
   - Obsługa błędów i powiadomień

3. Testy i optymalizacje
   - Testowanie wszystkich ścieżek użytkownika
   - Sprawdzenie obsługi błędów
   - Weryfikacja dostępności (WCAG AA)
   - Optymalizacja wydajności
