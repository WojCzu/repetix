# OpenRouter Service Implementation Plan

## 1. Opis usługi

`OpenRouterService` to klasa w TypeScript odpowiedzialna za komunikację z API OpenRouter. Umożliwia:

1. Wysyłanie wiadomości systemowych i użytkownika do LLM.
2. Odbieranie i walidację odpowiedzi zgodnie z `response_format` (schemat JSON).
3. Konfigurowanie modelu i parametrów.
4. Obsługę błędów i logowanie.

## 2. Opis konstruktora

Konstruktor przyjmuje:

| Pole            | Typ                                  | Opis                                                         |
| --------------- | ------------------------------------ | ------------------------------------------------------------ |
| `apiKey`        | `string`                             | Klucz API OpenRouter (z ENV: `OPENROUTER_API_KEY`).          |
| `baseUrl`       | `string`                             | Bazowy URL do OpenRouter (np. `https://openrouter.ai/v1`).   |
| `defaultModel`  | `string`                             | Domyślna nazwa modelu (np. `gpt-4o`).                        |
| `defaultParams` | `ModelParams`                        | Domyślne parametry modelu (np. `temperature`, `max_tokens`). |
| `logger?`       | `Logger`                             | Interfejs do logowania zdarzeń i błędów.                     |
| `fetcher?`      | `(input, init) => Promise<Response>` | Opcjonalny klient HTTP (np. `fetch` lub `axios`).            |

### Przykład użycia krycia ENV

```ts
const service = new OpenRouterService({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseUrl: process.env.OPENROUTER_BASE_URL!,
  defaultModel: "openapi/gpt-4o-mini",
  defaultParams: { temperature: 0.7, max_tokens: 150 },
});
```

## 3. Publiczne metody i pola

- `sendChatCompletion(
  systemMessage: string,
  userMessage: string,
  options?: ChatOptions
): Promise<ChatResponse>`

  - Buduje i wysyła żądanie do OpenRouter.
  - Parametry:
    1. `systemMessage` – wiadomość kontekstowa.
    2. `userMessage` – treść od użytkownika.
    3. `options` (opcjonalne) – nadpisuje `model`, `params`, `responseFormat`.
  - Zwraca `ChatResponse` po walidacji schematu.

- Publiczne pola:
  - `defaultModel: string`
  - `defaultParams: ModelParams`

## 4. Prywatne metody i pola

- `_buildPayload(systemMessage, userMessage, options)`

  - Łączy wiadomości w tablicę zgodnie z OpenRouter API:
    ```json
    [
      {"role": "system", "content": systemMessage},
      {"role": "user",   "content": userMessage}
    ]
    ```

- `_validateResponse(raw: any): ChatResponse`

  - Waliduje surową odpowiedź JSON przy użyciu `response_format`:
    ```json
    {
      "type": "json_schema",
      "json_schema": {
        "name": "chat_response",
        "strict": true,
        "schema": {
          "reply": { "type": "string" },
          "usage": {
            "type": "object",
            "properties": { "prompt_tokens": { "type": "number" }, "completion_tokens": { "type": "number" } }
          }
        }
      }
    }
    ```
  - **Uwaga:** Do walidacji można użyć Zod.

- `_handleError(error: any): never`

  - Normalizuje i rzuca błędy `ApiError`, `NetworkError`, `ValidationError`.

- Prywatne pole `_fetcher`
  - Iniekcja klienta HTTP.

## 5. Obsługa błędów

1. **NetworkError** – brak połączenia, timeout.
2. **ApiError** – odpowiedź HTTP ≠ 2xx.
3. **SchemaValidationError** – odpowiedź niezgodna z JSON Schema.
4. **InputValidationError** – przekroczony limit znaków (system/user).

Dla każdego:

- Obsłużyć w `_handleError`.
- Logować z użyciem `logger.error`.
- Rzucać przyjazne komunikaty do klienta.

## 6. Kwestie bezpieczeństwa

- Klucz API w ENV, nigdy w kodzie repozytorium.
- Ochrona przed rate limiting (backoff/retry).
- Nie logować wrażliwych danych.

## 7. Plan wdrożenia krok po kroku

1. **Instalacja zależności**
   - (Opcjonalnie) AJV/Zod do walidacji JSON Schema – wymaga potwierdzenia.
2. **Utworzenie pliku** `src/lib/services/OpenRouterService.ts` i zdefiniowanie klasy.
3. **Dodanie ENV** w `.env`:
   ```env
   OPENROUTER_API_KEY=...
   OPENROUTER_BASE_URL=https://openrouter.ai/v1
   ```
4. **Implementacja konstruktora** oraz inicjalizacja fetchera i loggera.
5. **Implementacja `_buildPayload`** wraz z przykładami wiadomości:
   - System: `"You are a helpful assistant specialized in flashcards."`
   - User: `"Explain the SM2 algorithm..."`
6. **Implementacja `sendChatCompletion`**:
   - Budowa `payload`.
   - Ustawienie nagłówków: `Authorization: Bearer ${apiKey}`, `Content-Type: application/json`.
7. **Walidacja odpowiedzi** przy użyciu `response_format`.
8. **Obsługa błędów** w `_handleError` i propagacja.
9. **Integracja z API endpoint**
   - Utworzyć `src/pages/api/chat.ts` lub `astro` endpoint,
   - Wywoływać `OpenRouterService.sendChatCompletion`.

---

_Gotowe wdrożenie `OpenRouterService` pozwoli na elastyczne konfigurowanie komunikatów, modeli i parametrów, z gwarancją walidacji odpowiedzi oraz odpornością na błędy._
