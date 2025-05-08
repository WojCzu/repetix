# Dokument wymagań produktu (PRD) – Repetix

## 1. Przegląd produktu

Repetix to aplikacja webowa umożliwiająca szybkie tworzenie i zarządzanie fiszkami do nauki metodą spaced repetition.  
Użytkownik może:

- wygenerować fiszki za pomocą AI na podstawie wprowadzonego tekstu (1 000–10 000 znaków),
- ręcznie tworzyć, edytować i usuwać fiszki (przód ≤ 200 znaków, tył ≤ 500 znaków),
- przeglądać własny zestaw fiszek,
- przeprowadzać sesje powtórek oparte na integracji z biblioteką SM2 (Node.js, licencja MIT),
- korzystać z prostego systemu kont (email + hasło, reset i zmiana hasła, bez potwierdzenia email).

UI zapewnia walidację limitów znaków i komunikaty "Tekst jest za krótki (minimum 1000 znaków)/Tekst jest za długi (maksimum 10000 znaków)". Komponenty są zgodne z poziomem dostępności WCAG AA. Aplikacja gromadzi metryki generacji i zapisu fiszek w bazie danych.

## 2. Problem użytkownika

Ręczne tworzenie wysokiej jakości fiszek jest czasochłonne, co zniechęca do korzystania z efektywnej metody nauki, jaką jest spaced repetition. Celem Repetix jest zminimalizowanie nakładu pracy dzięki automatyzacji generowania fiszek przez AI i uproszczonemu zarządzaniu zestawem.

## 3. Wymagania funkcjonalne

1. Generowanie fiszek przez AI

   - Wejście: tekst 1 000–10 000 znaków, walidowane w UI.
   - Wyjście: 1–3 kandydatury fiszek na każde 1 000 znaków, każda z przodem ≤ 200 i tyłem ≤ 500 znaków.
   - Proces: spinner → wywołanie usługi AI → wyświetlenie kandydatów.

2. Obsługa kandydatów AI

   - Akceptacja, edycja lub odrzucenie każdej kandydatury.
   - Zapis do bazy tylko zaakceptowanych lub edytowanych fiszek.
   - Inkrementacja `generatedCount` i `savedCount` w bazie danych.

3. Ręczne tworzenie, edycja i usuwanie fiszek

   - Formularz "Dodaj fiszkę" z licznikami znaków dla pól przód/tył.
   - Ograniczenia: przód ≤ 200 znaków, tył ≤ 500 znaków.
   - CRUD: lista fiszek odświeża się po każdej operacji.

4. System kont użytkowników

   - Rejestracja: email + hasło (bez potwierdzenia adresu).
   - Logowanie.
   - Reset hasła (email z linkiem → nowe hasło).
   - Zmiana hasła w ustawieniach.

5. Sesja powtórek

   - Integracja z biblioteką SM2 (Node.js, MIT).
   - Strona "Powtórki": pojedyncza fiszka, przycisk "Pokaż odpowiedź", ocena ("Znam", "Muszę powtórzyć"), kolejna fiszka.
   - Komunikat "Nie masz fiszek do powtórzenia" po wyczerpaniu zestawu.

6. UI i dostępność

   - Walidacja limitów znaków z czytelnymi komunikatami.
   - Komponenty zgodne z WCAG AA.

7. Telemetria
   - Tabela `FlashcardGenerationMetrics` z kolumnami `generatedCount` i `savedCount`.

## 4. Granice produktu

- Brak własnego, zaawansowanego algorytmu powtórek (SuperMemo, Anki).
- Brak importu formatów PDF, DOCX itp.
- Brak współdzielenia zestawów fiszek między użytkownikami.
- Brak integracji z innymi platformami edukacyjnymi.
- Brak aplikacji mobilnej (web only na początek).
- Brak deduplikacji fiszek i ostrzeżeń o powtórzeniach.
- Brak wersjonowania historii fiszki.
- Brak potwierdzania email przy rejestracji.

## 5. Historyjki użytkowników

### US-001

Tytuł: Rejestracja nowego użytkownika  
Opis: Jako niezarejestrowany użytkownik chcę utworzyć konto używając adresu email i hasła, aby uzyskać dostęp do aplikacji.  
Kryteria akceptacji:

- Formularz zawiera pola "email", "hasło", "potwierdź hasło".
- Przy poprawnym emailu i zgodnych hasłach konto zostaje utworzone, a użytkownik zostaje przekierowany do strony z informacją o konieczności weryfikacji email.
- System wysyła email z linkiem weryfikacyjnym na podany adres.
- Link weryfikacyjny przekierowuje użytkownika na stronę logowania.
- Przy niepoprawnym formacie email lub niezgodnych hasłach wyświetlany jest odpowiedni komunikat i rejestracja jest blokowana.
- Wszystkie pola są wymagane.
- Po kliknięciu w link weryfikacyjny, konto zostaje aktywowane i użytkownik może się zalogować.

### US-002

Tytuł: Logowanie  
Opis: Jako zarejestrowany użytkownik chcę się zalogować za pomocą email i hasła, aby uzyskać dostęp do chronionych widoków.  
Kryteria akceptacji:

- Formularz zawiera pola "email" i "hasło".
- Poprawne dane uwierzytelniające powodują zalogowanie i przekierowanie do strony głównej.
- Niepoprawne dane wyświetlają komunikat "Nieprawidłowy adres email lub hasło".

### US-003

Tytuł: Reset hasła  
Opis: Jako użytkownik chcę zresetować hasło, gdy je zapomnę, aby odzyskać dostęp do konta.  
Kryteria akceptacji:

- Strona resetu hasła zawiera pole "email".
- Przy wprowadzeniu istniejącego emaila wysyłana jest wiadomość z linkiem do resetu.
- Przy nieistniejącym emailu wyświetla się komunikat "Jeśli email jest powiązany z kontem, wysłaliśmy link do zmiany hasła".
- Po wysłaniu formularza wyświetlić komunikat: "Jeśli email jest powiązany z kontem, wysłaliśmy link do zmiany hasła".
- Link resetu prowadzi do formularza z polami "nowe hasło" i "potwierdź hasło".
- Po poprawnym ustawieniu nowego hasła użytkownik może się zalogować.

### US-004

Tytuł: Zmiana hasła  
Opis: Jako zalogowany użytkownik chcę zmienić swoje hasło z poziomu ustawień, by poprawić bezpieczeństwo.  
Kryteria akceptacji:

- Sekcja zmiany hasła zawiera pola "aktualne hasło", "nowe hasło", "potwierdź nowe hasło".
- Poprawne podanie aktualnego hasła i zgodnych nowych haseł zapisuje zmianę i wyświetla potwierdzenie.
- Błąd przy nieprawidłowym haśle lub braku zgodności nowych haseł wyświetla odpowiedni komunikat.

### US-005

Tytuł: Ręczne tworzenie fiszki  
Opis: Jako zalogowany użytkownik chcę ręcznie dodać nową fiszkę, aby wzbogacić mój zestaw.  
Kryteria akceptacji:

- Formularz "Dodaj fiszkę" z polami "przód" (≤ 200 znaków) i "tył" (≤ 500 znaków) oraz licznikami znaków.
- Wprowadzenie tekstu w granicach limitów i zatwierdzenie zapisuje fiszkę i wyświetla ją na liście.
- Przekroczenie limitu znaków wyświetla komunikat "Przekroczono limit znaków (maksymalnie 200)" lub "Przekroczono limit znaków (maksymalnie 500)".

### US-006

Tytuł: Edycja fiszki  
Opis: Jako zalogowany użytkownik chcę edytować istniejącą fiszkę, aby poprawić lub rozbudować jej treść.  
Kryteria akceptacji:

- W widoku listy przy każdej fiszce dostępny jest przycisk "Edytuj".
- Formularz edycji wypełnia się istniejącą treścią i respektuje limity znaków.
- Zatwierdzenie zmian aktualizuje fiszkę w bazie i odświeża listę.

### US-007

Tytuł: Usuwanie fiszki  
Opis: Jako zalogowany użytkownik chcę usunąć niepotrzebną fiszkę.  
Kryteria akceptacji:

- W widoku listy przy każdej fiszce dostępny jest przycisk "Usuń".
- Kliknięcie "Usuń" wymaga potwierdzenia ("Czy na pewno chcesz usunąć tę fiszkę?").
- Po potwierdzeniu fiszka zostaje trwale usunięta i znika z listy.

### US-008

Tytuł: Wprowadzanie tekstu i walidacja długości  
Opis: Jako zalogowany użytkownik chcę wprowadzić tekst o długości 1000–10000 znaków, aby generować na jego podstawie fiszki.  
Kryteria akceptacji:

- Pole tekstowe z licznikiem znaków.
- Przy < 1000 znaków komunikat "Tekst jest za krótki (minimum 1000 znaków)".
- Przy > 10000 znaków komunikat "Tekst jest za długi (maksimum 10000 znaków)".
- Przy prawidłowej długości przycisk "Generuj" jest aktywny.

### US-009

Tytuł: Generowanie fiszek przez AI  
Opis: Jako zalogowany użytkownik chcę wywołać usługę AI, aby uzyskać propozycje fiszek.  
Kryteria akceptacji:

- Po kliknięciu "Generuj" wyświetla się spinner i trwa wywołanie usługi AI.
- Usługa zwraca od 1 do 3 kandydatów na fiszkę na każde 1000 znaków.
- Kandydaci wyświetlają przód ≤ 200 i tył ≤ 500 znaków.
- Po zakończeniu generowania lista kandydatów staje się widoczna.

### US-010

Tytuł: Obsługa kandydatów AI  
Opis: Jako zalogowany użytkownik chcę akceptować, edytować lub odrzucać wygenerowane fiszki.  
Kryteria akceptacji:

- Przy każdej fiszce znajduje się przycisk pozwalający na jej zatwierdzenie, edycję lub odrzucenie.
- "Akceptuj" oznacza zaznaczenie fiszki do zapisania.
- "Edytuj" pozwala modyfikować przód/tył w limicie i zapisać zmianę.
- "Odrzuć" usuwa kandydaturę bez zapisu.
- Po zatwierdzeniu wybranych fiszek użytkownik może kliknąć przycisk "Zapisz wybrane fiszki", aby dodać je zbiorczo do bazy danych.

### US-011

Tytuł: Przegląd zapisanych fiszek  
Opis: Jako zalogowany użytkownik chcę zobaczyć listę wszystkich moich fiszek.  
Kryteria akceptacji:

- Sekcja "Moje fiszki" w menu.
- Tabela lub siatka z kolumnami przód, tył, data utworzenia.
- Lista odświeża się po każdej operacji CRUD.

### US-012

Tytuł: Sesja powtórek  
Opis: Jako zalogowany użytkownik chcę uruchomić sesję powtórek, aby utrwalać materiał.  
Kryteria akceptacji:

- Sekcja "Powtórki" w menu.
- Kliknięcie "Rozpocznij powtórki" inicjuje algorytm SM2.
- Wyświetlanie pojedynczej fiszki, przycisk "Pokaż odpowiedź", ocena ("Znam", "Muszę powtórzyć"), kolejna fiszka.
- Gdy brak fiszek do powtórek, komunikat "Nie masz fiszek do powtórzenia".

### US-013

Tytuł: Ograniczenie dostępu dla niezalogowanych  
Opis: Jako niezalogowany użytkownik chcę być przekierowany do logowania, gdy próbuję uzyskać dostęp do chronionych widoków.  
Kryteria akceptacji:

- Próba wejścia na `/flashcards`, `/generate` lub `/review` przekierowuje na `/login`.
- Po zalogowaniu następuje przekierowanie do pierwotnie żądanego widoku lub strony głównej.

### US-014

Tytuł: Wylogowanie  
Opis: Jako zalogowany użytkownik chcę móc się wylogować, aby zakończyć sesję i zabezpieczyć moje konto.  
Kryteria akceptacji:

- W nagłówku aplikacji dostępny jest przycisk "Wyloguj".
- Kliknięcie przycisku wysyła `POST /api/auth/logout`.
- Po pomyślnym wylogowaniu następuje przekierowanie użytkownika na stronę `/login`.
- Dostęp do chronionych widoków jest zablokowany (przekierowanie na `/login?redirectTo=...`).

## 6. Metryki sukcesu

1. Procent fiszek wygenerowanych przez AI zaakceptowanych lub edytowanych ≥ 75 %  
   (miara: `savedCount / generatedCount >= 0.75` w tabeli `FlashcardGenerationMetrics`)
2. Procent fiszek utworzonych z AI względem wszystkich nowo utworzonych fiszek ≥ 75 %  
   (miara: liczba fiszek z `source = 'AI'` / całkowita liczba fiszek, obliczana na podstawie pola `source` w tabeli `Flashcards`)
3. Monitorowane zdarzenia: każde wywołanie AI (inkrementacja `generatedCount`) i każde zapisanie fiszki (`savedCount`).
