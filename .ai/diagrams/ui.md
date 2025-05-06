# Architektura UI Repetix

## 1. Struktura stron i layoutów

```mermaid
flowchart TD
    %% Definicja stylów
    classDef pageClass fill:#e1f5fe,stroke:#0288d1,stroke-width:3px,color:#000,font-size:16px,font-weight:bold
    classDef layoutClass fill:#fff9c4,stroke:#fbc02d,stroke-width:3px,color:#000,font-size:16px,font-weight:bold
    classDef viewClass fill:#f3e5f5,stroke:#9c27b0,stroke-width:3px,color:#000,font-size:16px,font-weight:bold

    %% Strony Astro
    subgraph Pages["Strony Astro"]
        MainPages["Główne strony<br/>index.astro<br/>generate.astro<br/>flashcards.astro<br/>review.astro"]:::pageClass
        AuthPages["Strony autoryzacji<br/>register.astro<br/>login.astro<br/>reset-password.astro<br/>reset-password/[token].astro"]:::pageClass
        SettingsPages["Strony ustawień<br/>settings/change-password.astro"]:::pageClass
    end

    %% Layouty
    subgraph Layouts["Layouty"]
        MainLayout["Layout.astro"]:::layoutClass
        AuthLayout["AuthLayout.astro"]:::layoutClass
    end

    %% Komponenty widoków
    subgraph Views["Główne komponenty widoków"]
        WelcomeView["Welcome.astro"]:::viewClass
        GenerateView["GenerateView"]:::viewClass
        FlashcardsView["FlashcardsView"]:::viewClass
        ReviewView["ReviewView"]:::viewClass
    end

    %% Relacje
    MainPages --> MainLayout
    AuthPages --> AuthLayout
    SettingsPages --> MainLayout

    MainPages --> Views
```

## 2. Komponenty generowania fiszek

```mermaid
flowchart TD
    %% Definicja stylów
    classDef viewClass fill:#f3e5f5,stroke:#9c27b0,stroke-width:3px,color:#000,font-size:16px,font-weight:bold
    classDef componentClass fill:#bbdefb,stroke:#1976d2,stroke-width:3px,color:#000,font-size:16px,font-weight:bold
    classDef stateClass fill:#ffebee,stroke:#f44336,stroke-width:3px,color:#000,font-size:16px,font-weight:bold
    classDef uiClass fill:#e8f5e9,stroke:#4caf50,stroke-width:3px,color:#000,font-size:16px,font-weight:bold

    %% Komponenty
    GenerateView["GenerateView"]:::viewClass

    subgraph GenerateComponents["Komponenty generowania"]
        TextInputSection["TextInputSection"]:::componentClass
        CandidateListSection["CandidateListSection"]:::componentClass
        EditFlashcardModal["EditFlashcardModal"]:::componentClass
        CandidateCard["CandidateCard"]:::componentClass
        BatchActionBar["BatchActionBar"]:::componentClass
        CardListSkeleton["CardListSkeleton"]:::componentClass
    end

    subgraph UIComponents["Potrzebne komponenty UI"]
        Button["Button"]:::uiClass
        Card["Card"]:::uiClass
        Dialog["Dialog"]:::uiClass
        Badge["Badge"]:::uiClass
        SourceBadge["SourceBadge"]:::uiClass
        TextareaWithCounter["TextareaWithCounter"]:::uiClass
        ValidationMessage["ValidationMessage"]:::uiClass
        Skeleton["Skeleton"]:::uiClass
    end

    subgraph State["Zarządzanie stanem"]
        GenerateFormContext["GenerateFormContext"]:::stateClass
    end

    %% Relacje
    GenerateView --> GenerateComponents
    GenerateView --> State

    TextInputSection --> Button
    TextInputSection --> TextareaWithCounter
    TextInputSection --> ValidationMessage

    CandidateListSection --> CandidateCard
    CandidateListSection --> BatchActionBar
    CandidateListSection --> CardListSkeleton

    CandidateCard --> Card
    CandidateCard --> Badge
    CandidateCard --> SourceBadge
    CandidateCard --> Button

    EditFlashcardModal --> Dialog
    EditFlashcardModal --> TextareaWithCounter
    EditFlashcardModal --> ValidationMessage
    EditFlashcardModal --> Button
```

## 3. Komponenty zarządzania fiszkami

```mermaid
flowchart TD
    %% Definicja stylów
    classDef viewClass fill:#f3e5f5,stroke:#9c27b0,stroke-width:3px,color:#000,font-size:16px,font-weight:bold
    classDef componentClass fill:#bbdefb,stroke:#1976d2,stroke-width:3px,color:#000,font-size:16px,font-weight:bold
    classDef stateClass fill:#ffebee,stroke:#f44336,stroke-width:3px,color:#000,font-size:16px,font-weight:bold
    classDef uiClass fill:#e8f5e9,stroke:#4caf50,stroke-width:3px,color:#000,font-size:16px,font-weight:bold

    %% Komponenty
    FlashcardsView["FlashcardsView"]:::viewClass

    subgraph FlashcardComponents["Komponenty zarządzania fiszkami"]
        FlashcardList["FlashcardList"]:::componentClass
        FlashcardCard["FlashcardCard"]:::componentClass
        FlashcardModal["FlashcardModal"]:::componentClass
        DeleteConfirmation["DeleteConfirmation"]:::componentClass
    end

    subgraph UIComponents["Potrzebne komponenty UI"]
        Button["Button"]:::uiClass
        Card["Card"]:::uiClass
        Dialog["Dialog"]:::uiClass
        Badge["Badge"]:::uiClass
        FormInput["FormInput"]:::uiClass
        TextareaWithCounter["TextareaWithCounter"]:::uiClass
        ValidationMessage["ValidationMessage"]:::uiClass
        Toast["Toast"]:::uiClass
    end

    subgraph State["Zarządzanie stanem"]
        FlashcardsContext["FlashcardsContext"]:::stateClass
    end

    %% Relacje
    FlashcardsView --> FlashcardComponents
    FlashcardsView --> State

    FlashcardList --> FlashcardCard
    FlashcardList --> Button

    FlashcardCard --> Card
    FlashcardCard --> Badge
    FlashcardCard --> Button

    FlashcardModal --> Dialog
    FlashcardModal --> FormInput
    FlashcardModal --> TextareaWithCounter
    FlashcardModal --> ValidationMessage
    FlashcardModal --> Button

    DeleteConfirmation --> Dialog
    DeleteConfirmation --> Button
```

## 4. Komponenty sesji powtórek

```mermaid
flowchart TD
    %% Definicja stylów
    classDef viewClass fill:#f3e5f5,stroke:#9c27b0,stroke-width:3px,color:#000,font-size:16px,font-weight:bold
    classDef componentClass fill:#bbdefb,stroke:#1976d2,stroke-width:3px,color:#000,font-size:16px,font-weight:bold
    classDef stateClass fill:#ffebee,stroke:#f44336,stroke-width:3px,color:#000,font-size:16px,font-weight:bold
    classDef uiClass fill:#e8f5e9,stroke:#4caf50,stroke-width:3px,color:#000,font-size:16px,font-weight:bold

    %% Komponenty
    ReviewView["ReviewView"]:::viewClass

    subgraph ReviewComponents["Komponenty sesji powtórek"]
        ReviewCard["ReviewCard"]:::componentClass
        ReviewControls["ReviewControls"]:::componentClass
        ProgressIndicator["ProgressIndicator"]:::componentClass
    end

    subgraph UIComponents["Potrzebne komponenty UI"]
        Button["Button"]:::uiClass
        Card["Card"]:::uiClass
        ProgressBar["ProgressBar"]:::uiClass
        Toast["Toast"]:::uiClass
    end

    subgraph State["Zarządzanie stanem"]
        ReviewContext["ReviewContext"]:::stateClass
    end

    %% Relacje
    ReviewView --> ReviewComponents
    ReviewView --> State

    ReviewCard --> Card
    ReviewControls --> Button
    ProgressIndicator --> ProgressBar
```

## 5. Komponenty autoryzacji

```mermaid
flowchart TD
    %% Definicja stylów
    classDef pageClass fill:#e1f5fe,stroke:#0288d1,stroke-width:3px,color:#000,font-size:16px,font-weight:bold
    classDef formClass fill:#bbdefb,stroke:#1976d2,stroke-width:3px,color:#000,font-size:16px,font-weight:bold
    classDef stateClass fill:#ffebee,stroke:#f44336,stroke-width:3px,color:#000,font-size:16px,font-weight:bold
    classDef uiClass fill:#e8f5e9,stroke:#4caf50,stroke-width:3px,color:#000,font-size:16px,font-weight:bold

    %% Strony
    Register["register.astro"]:::pageClass
    Login["login.astro"]:::pageClass
    ResetPwd["reset-password.astro"]:::pageClass
    ResetToken["reset-password/[token].astro"]:::pageClass
    Settings["settings/change-password.astro"]:::pageClass

    %% Komponenty
    subgraph AuthComponents["Komponenty autoryzacji"]
        LoginForm["LoginForm"]:::formClass
        RegistrationForm["RegistrationForm"]:::formClass
        RequestResetForm["RequestResetForm"]:::formClass
        NewPasswordForm["NewPasswordForm"]:::formClass
        ChangePasswordForm["ChangePasswordForm"]:::formClass
        PasswordStrengthMeter["PasswordStrengthMeter"]:::formClass
    end

    subgraph UIComponents["Potrzebne komponenty UI"]
        FormInput["FormInput"]:::uiClass
        Button["Button"]:::uiClass
        ValidationMessage["ValidationMessage"]:::uiClass
        Toast["Toast"]:::uiClass
    end

    subgraph State["Zarządzanie stanem"]
        AuthContext["AuthContext"]:::stateClass
    end

    %% Relacje
    Register --> RegistrationForm
    Login --> LoginForm
    ResetPwd --> RequestResetForm
    ResetToken --> NewPasswordForm
    Settings --> ChangePasswordForm

    AuthComponents --> State

    RegistrationForm --> PasswordStrengthMeter
    NewPasswordForm --> PasswordStrengthMeter
    ChangePasswordForm --> PasswordStrengthMeter

    RegistrationForm --> FormInput
    RegistrationForm --> Button
    RegistrationForm --> ValidationMessage

    LoginForm --> FormInput
    LoginForm --> Button
    LoginForm --> ValidationMessage

    RequestResetForm --> FormInput
    RequestResetForm --> Button
    RequestResetForm --> Toast

    NewPasswordForm --> FormInput
    NewPasswordForm --> Button
    NewPasswordForm --> ValidationMessage
    NewPasswordForm --> Toast

    ChangePasswordForm --> FormInput
    ChangePasswordForm --> Button
    ChangePasswordForm --> ValidationMessage
    ChangePasswordForm --> Toast
```

## 6. Współdzielone komponenty UI

```mermaid
flowchart TD
    %% Definicja stylów
    classDef uiClass fill:#e8f5e9,stroke:#4caf50,stroke-width:3px,color:#000,font-size:16px,font-weight:bold
    classDef categoryClass fill:#bbdefb,stroke:#1976d2,stroke-width:3px,color:#000,font-size:16px,font-weight:bold

    %% Grupy komponentów
    UIRoot["Komponenty UI<br/>(src/components/ui)"]:::categoryClass

    subgraph BasicUI["Podstawowe komponenty UI"]
        Button["button.tsx<br/>Przycisk z wariantami"]:::uiClass
        Card["card.tsx<br/>Kontener karty"]:::uiClass
        Badge["badge.tsx<br/>Etykieta/oznaczenie"]:::uiClass
        SourceBadge["source-badge.tsx<br/>Badge źródła fiszki"]:::uiClass
        Tooltip["tooltip.tsx<br/>Dymek z podpowiedzią"]:::uiClass
    end

    subgraph FormUI["Komponenty formularzy"]
        Textarea["textarea.tsx<br/>Pole tekstowe"]:::uiClass
        TextareaCounter["TextareaWithCounter.tsx<br/>Pole z licznikiem znaków"]:::uiClass
        ValidationMsg["ValidationMessage.tsx<br/>Komunikat walidacji"]:::uiClass
    end

    subgraph DialogUI["Komponenty dialogowe"]
        Dialog["dialog.tsx<br/>Okno modalne"]:::uiClass
    end

    subgraph FeedbackUI["Komponenty informacji zwrotnej"]
        Skeleton["skeleton.tsx<br/>Placeholder ładowania"]:::uiClass
        Sonner["sonner.tsx<br/>System powiadomień (toast)"]:::uiClass
    end

    %% Hierarchia komponentów
    UIRoot --> BasicUI
    UIRoot --> FormUI
    UIRoot --> DialogUI
    UIRoot --> FeedbackUI

    %% Relacje między komponentami
    TextareaCounter --> Textarea
    SourceBadge --> Badge

    %% Użytkownicy komponentów
    TextInputSection["TextInputSection"]
    CandidateCard["CandidateCard"]
    EditFlashcardModal["EditFlashcardModal"]
    FlashcardList["FlashcardList"]
    ReviewUI["Komponenty ReviewView"]
    AuthForms["Formularze Auth"]

    %% Najczęściej używane komponenty i ich użytkownicy
    TextInputSection --> TextareaCounter
    TextInputSection --> ValidationMsg
    TextInputSection --> Button

    CandidateCard --> Card
    CandidateCard --> Badge
    CandidateCard --> SourceBadge

    EditFlashcardModal --> Dialog
    EditFlashcardModal --> TextareaCounter

    FlashcardList --> Card
    FlashcardList --> Button

    ReviewUI --> Button
    ReviewUI --> Card

    AuthForms --> Button
    AuthForms --> ValidationMsg
```
