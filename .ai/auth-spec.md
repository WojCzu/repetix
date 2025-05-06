# Specyfikacja modułu autentykacji Repetix

Poniższa dokumentacja opisuje projekt architektury rejestracji, logowania, odzyskiwania i zmiany hasła użytkowników.

---

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1 Struktura stron Astro

`src/pages/`

- **register.astro** – strona rejestracji (US-001)
- **login.astro** – strona logowania (US-002); obsługuje parametr `redirectTo` w query i przekierowuje po pomyślnym logowaniu.
- **reset-password.astro** – formularz zgłoszenia resetu hasła (US-003)
- **reset-password/[token].astro** – ustawienie nowego hasła na podstawie tokenu
- **settings/change-password.astro** – zmiana hasła (US-004)

Wszystkie powyższe strony korzystają z **AuthLayout.astro**.

### 1.2 Layouty

`src/layouts/AuthLayout.astro`

- Wspólny header z logo i tytułem strony.
- Kontener formularza wycentrowany i responsywny (Tailwind).
- Linki pomocnicze (np. „Masz już konto? Zaloguj się”).
- Zapewnia zgodność z WCAG AA (kontrast, aria-label, focus-visible).

`src/layouts/MainLayout.astro`

- Menu główne dostępne po zalogowaniu.
- Linki do `/generate`, `/flashcards`, `/review` w nagłówku.
- Przycisk Wyloguj w nagłówku.

### 1.3 Komponenty React w `src/components/auth`

- **PasswordStrengthMeter.tsx**

  - Komponent wyświetlający siłę hasła (poziomy, kolory) na podstawie wprowadzanej wartości.

- **RegistrationForm.tsx**

  - Pola: `email`, `password`, `confirmPassword`.
  - Walidacja w locie: regex email, minimum 8 znaków, uwzględnienie dużych/małych liter oraz znaków specjalnych.
  - Wskaźnik siły hasła: użycie `PasswordStrengthMeter`.
  - Wywołanie `POST /api/auth/register`.
  - Obsługa odpowiedzi: w przypadku `{ error }` wyświetla komunikat zwrócony z API pod odpowiednim polem w kolorze `text-red-600` i ustawia fokus na polu; w przypadku `{ data }` przekierowuje użytkownika do `/` i inicjalizuje sesję.

- **LoginForm.tsx**

  - Pola: `email`, `password`.
  - Props: `redirectTo?: string`.
  - Wywołanie `POST /api/auth/login`.
  - Obsługa odpowiedzi: w przypadku `{ error }` wyświetla komunikat "Nieprawidłowy adres email lub hasło"; w przypadku `{ data }` przekierowuje do `redirectTo` lub do `/`.

- **RequestResetForm.tsx**

  - Pole: `email`.
  - Wywołanie `POST /api/auth/request-password-reset`.
  - Obsługa odpowiedzi: zawsze wyświetla komunikat "Jeśli email jest powiązany z kontem, wysłaliśmy link do zmiany hasła".

- **NewPasswordForm.tsx**

  - Pola: `newPassword`, `confirmPassword`.
  - Walidacja siły hasła: reguły (min 8 znaków, duże/małe litery, znaki specjalne) i wsparcie przez `PasswordStrengthMeter`.
  - Pobranie `token` z query params.
  - Wywołanie `POST /api/auth/reset-password` z `{ token, newPassword }`.
  - Obsługa odpowiedzi: w przypadku `{ data }` przekierowanie do `/login` z komunikatem "Hasło zostało zresetowane"; w przypadku `{ error: 'Link jest nieaktywny' }` wyświetlić komunikat "Link jest nieaktywny lub wygasł"; inne `{ error }` wyświetlić pod polem "Błąd: {error}".

- **ChangePasswordForm.tsx**
  - Pola: `currentPassword`, `newPassword`, `confirmPassword`.
  - Walidacja siły nowego hasła: reguły i wskaźnik siły (`PasswordStrengthMeter`).
  - Wywołanie `POST /api/auth/change-password` z `{ currentPassword, newPassword }`.
  - Obsługa odpowiedzi: w przypadku `{ data }` wyświetla komunikat potwierdzający zmianę hasła; w przypadku `{ error }` mapuje `auth/invalid-password` na komunikat "Niepoprawne aktualne hasło" i wyświetla inne błędy pod polem "Błąd: {error}".

Podział odpowiedzialności:

- Strony Astro odpowiadają za SEO i przekazanie props (np. `token`).
- Komponenty React obsługują UI, lokalny stan i walidację.
- Komponenty należą do biblioteki Shadcn/ui dla zgodności stylu.

### 1.4 Walidacja i komunikaty błędów

- Email: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, komunikat: „Nieprawidłowy format adresu email”.
- Hasło: min 8 znaków, komunikat: „Hasło musi mieć co najmniej 8 znaków”.
- Potwierdzenie hasła: zgodność, komunikat: „Hasła nie są zgodne”.
- Błędy serwera (np. istniejący użytkownik): tekst zwrócony z API.
- Komunikaty wyświetlane pod polami w `text-red-600`, focus na błędzie.
- Spinner i dezaktywacja przycisku podczas oczekiwania.

### 1.5 Kluczowe scenariusze użytkownika

1. **Rejestracja** – poprawne dane → przekierowanie na `/` + sesja aktywna.
2. **Logowanie** – poprawne/niepoprawne dane → odpowiednie komunikaty.
3. **Reset hasła** – po wysłaniu formularza wyświetlić komunikat: „Jeśli email jest powiązany z kontem, wysłaliśmy link do zmiany hasła”.
4. **Ustawienie nowego hasła** – poprawny token → przekierowanie do `/login`; niepoprawny → „Link jest nieaktywny”.
5. **Zmiana hasła** – poprawne hasła → potwierdzenie; błąd currentPassword → „Niepoprawne aktualne hasło”.
6. **Dostęp chroniony** – nieautoryzowany dostęp do `/flashcards`, `/generate`, `/review`, `/settings` przekierowuje na `/login?redirectTo=...`.
7. **Wylogowanie** – użytkownik kliknie przycisk „Wyloguj” w nagłówku, wykonywane jest `POST /api/auth/logout`, a po sukcesie następuje przekierowanie na `/login`.

---

## 2. LOGIKA BACKENDOWA

### 2.1 Struktura endpointów API

W katalogu `src/pages/api/auth`:

| Plik                      | Metoda | Wejście                            | Akcja                                                                                                                                                                                          |
| ------------------------- | ------ | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| register.ts               | POST   | `{ email, password }`              | supabase.auth.signUp; mapowanie błędu `auth/email-already-in-use` na `{ error: 'Konto o podanym adresie email już istnieje' }`.                                                                |
| login.ts                  | POST   | `{ email, password }`              | `supabase.auth.signInWithPassword`; mapowanie błędu uwierzytelniania na `{ error: 'Nieprawidłowy adres email lub hasło' }`.                                                                    |
| logout.ts                 | POST   | —                                  | `supabase.auth.signOut`                                                                                                                                                                        |
| request-password-reset.ts | POST   | `{ email }`                        | `supabase.auth.resetPasswordForEmail` z linkiem do `/reset-password?token=`; zawsze zwraca HTTP 200 z `{ data }` (neutralny komunikat).                                                        |
| reset-password.ts         | POST   | `{ token, newPassword }`           | supabase.auth.updateUser({ password }, { accessToken: token }); jeśli token jest nieaktywny lub wygasł – zwraca HTTP 400 z `{ error: 'Link jest nieaktywny' }`.                                |
| change-password.ts        | POST   | `{ currentPassword, newPassword }` | Weryfikacja sesji + reauth (ponowna walidacja currentPassword) + supabase.auth.updateUser({ password }); mapowanie błędu `auth/invalid-password` na `{ error: 'Niepoprawne aktualne hasło' }`. |

### 2.2 Walidacja danych i obsługa wyjątków

- Każdy handler najpierw parsuje payload za pomocą Zod.
- Błędy walidacji → HTTP 400 + `{ error: string }`.
- Błędy Supabase → HTTP 4xx/5xx + `{ error: message }`.
- Logowanie błędów serwerowych w `src/lib/logger.ts`.
- Odpowiedzi API w ujednoliconym formacie JSON `{ data?, error? }`.

### 2.3 Middleware i SSR w Astro

`src/middleware/index.ts`:

```ts
import { createServerClient } from '@supabase/auth-helpers-astro';

export async function onRequest({ request, redirect, next }) {
  const publicRoutes = ['/login', '/register', '/reset-password'];
  const protectedRoutes = ['/flashcards', '/generate', '/review', '/settings'];

  if (protectedRoutes.some(p => request.url.pathname.startsWith(p))) {
    const supabase = createServerClient({ request, //... });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect(307, `/login?redirectTo=${encodeURIComponent(request.url.pathname)}`);
    }
  }
  return next();
}
```

- Konfiguracja middleware w `astro.config.mjs`.

---

## 3. SYSTEM AUTENTYKACJI

### 3.1 Integracja z Supabase Auth

- `src/lib/supabaseClient.ts`:

```ts
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(import.meta.env.PUBLIC_SUPABASE_URL, import.meta.env.PUBLIC_SUPABASE_ANON_KEY);
```

- W SSR-handlerach użycie `createServerClient()` z `@supabase/auth-helpers-astro`.

### 3.2 Zarządzanie sesją i nawigacja

- Po rejestracji/logowaniu: Supabase zwraca cookie HttpOnly.
- Client-side: nasłuchiwanie `supabase.auth.onAuthStateChange` do aktualizacji UI.
- `MainLayout.astro` pokazuje menu zgodnie ze stanem sesji.

### 3.3 Wylogowanie

- Endpoint `POST /api/auth/logout` wywołuje `supabase.auth.signOut()`.
- Przycisk „Wyloguj” w `MainLayout` → fetch → przekierowanie do `/login`.

**Kontrakty API**:

- Wszystkie endpointy przyjmują i zwracają JSON.
- W przypadku sukcesu: `{ data: {...} }`, w przypadku błędu: `{ error: 'komunikat' }`.

### 3.4 Globalny store i dostęp do informacji o użytkowniku

- Utworzyć React Context w `src/context/AuthContext.tsx`:

  ```ts
  import React, { createContext, useContext, useEffect, useState } from 'react';
  import { supabase } from '../lib/supabaseClient';
  import type { Session, User } from '@supabase/supabase-js';

  interface AuthContextType {
    session: Session | null;
    user: User | null;
  }

  const AuthContext = createContext<AuthContextType>({ session: null, user: null });

  export const AuthProvider: React.FC = ({ children }) => {
    const [session, setSession] = useState<Session | null>(supabase.auth.getSession().data.session);
    const [user, setUser] = useState<User | null>(session?.user ?? null);

    useEffect(() => {
      const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      });
      return () => { listener.subscription.unsubscribe(); };
    }, []);

    return (
      <AuthContext.Provider value={{ session, user }}>
        {children}
      </AuthContext.Provider>
    );
  };

  export const useAuth = () => useContext(AuthContext);
  ```

- W `src/layouts/MainLayout.astro` (lub root React wrapper) owinąć komponenty React w `<AuthProvider>`:

  ```astro
  ---
  import { AuthProvider } from "../context/AuthContext";
  ---

  <AuthProvider>
    <!-- ... children ... -->
  </AuthProvider>
  ```

- W SSR middleware (`src/middleware/index.ts`) po pobraniu sesji dodać do `request.locals` lub przekazywać jako props do Astro:
  ```ts
  const {
    data: { session },
  } = await supabase.auth.getSession();
  request.locals.session = session;
  ```
  oraz w `onRequest` zwracać je dalej:
  ```ts
  return next({ props: { session: request.locals.session } });
  ```
- Dzięki temu strony Astro mogą inicjalizować `AuthProvider` z SSR-props:
  ```tsx
  <AuthProvider initialSession={Astro.props.session}>
    <!-- ... -->
  </AuthProvider>
  ```

To pozwoli na jednolite zarządzanie stanem sesji i danych użytkownika w całej appce, zarówno w SSR jak i client-side.
