# Repetix

A web application for fast creation and management of flashcards using spaced repetition, powered by AI and a simple review workflow.

## Table of Contents

1. [Project Description](#project-description)
2. [Tech Stack](#tech-stack)
3. [Getting Started Locally](#getting-started-locally)
4. [Available Scripts](#available-scripts)
5. [Testing](#testing)
6. [Project Scope](#project-scope)
7. [Project Status](#project-status)
8. [License](#license)

## Project Description

Repetix helps learners quickly generate high-quality flashcards from custom text (1,000–10,000 characters) using AI, while also providing manual flashcard CRUD operations and spaced repetition review sessions via the SM2 algorithm. The app enforces character limits on front (≤200) and back (≤500) sides, is accessible (WCAG AA compliant), and tracks generation/save metrics.

For a full list of requirements and user stories, see the [Product Requirements Document](./.ai/prd.md).

## Tech Stack

### Frontend

- **Astro 5** – Fast static site generation with minimal client JavaScript
- **React 19** – Dynamic, interactive UI components
- **TypeScript 5** – Static typing and enhanced IDE support
- **Tailwind CSS 4** – Utility-first styling
- **Shadcn/ui** – Accessible React component library

### Backend

- **Supabase** – PostgreSQL database, authentication, and API SDK
- **Openrouter.ai** – AI model orchestration and cost controls

### CI/CD & Deployment

- **GitHub Actions** – CI/CD pipelines
- **DigitalOcean** – Docker-based hosting

### Testing

- **Vitest** – Unit and integration testing framework
- **React Testing Library** – Testing UI components
- **Playwright** – End-to-end testing
- **MSW** – API mocking for tests
- **Axe-core** – Accessibility testing

## Getting Started Locally

### Prerequisites

- Node.js v22.15.0 (see `.nvmrc`)
- npm

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/WojCzu/repetix.git
   cd repetix
   ```

2. **Configure environment variables**  
   Create a `.env` file in the project root with the following variables:

   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000` by default.

## Available Scripts

| Script                  | Description                          |
| ----------------------- | ------------------------------------ |
| `npm run dev`           | Start Astro development server       |
| `npm run build`         | Build production assets              |
| `npm run preview`       | Preview the production build locally |
| `npm run astro`         | Run the Astro CLI                    |
| `npm run lint`          | Lint all source files with ESLint    |
| `npm run lint:fix`      | Lint & auto-fix problems             |
| `npm run format`        | Format code with Prettier            |
| `npm run test`          | Run unit and integration tests       |
| `npm run test:watch`    | Run tests in watch mode              |
| `npm run test:ui`       | Run tests with UI interface          |
| `npm run test:coverage` | Run tests with coverage report       |
| `npm run test:e2e`      | Run end-to-end tests with Playwright |
| `npm run test:e2e:ui`   | Run E2E tests with Playwright UI     |

## Testing

The project uses a comprehensive testing strategy including unit, integration, and end-to-end tests:

### Unit and Integration Tests

Unit and integration tests use Vitest with the following setup:

- **Testing Libraries**: React Testing Library for component testing
- **Test Environment**: JSDOM for simulating browser environment
- **Coverage Reporting**: V8 coverage provider with thresholds set to 80%
- **Accessibility Testing**: Automated checks with jest-axe

Run unit tests with `npm run test` or in watch mode with `npm run test:watch`.

### End-to-End Tests

E2E tests use Playwright with the following setup:

- **Browser**: Chromium (Desktop Chrome)
- **Framework**: Page Object Model for improved maintainability
- **Features**: Screenshots on failure, tracing for debugging
- **Reports**: HTML and list reporters

Run E2E tests with `npm run test:e2e` or with UI interface using `npm run test:e2e:ui`.

For production testing (using the built application):

```bash
npm run test:e2e:prod
```

## Project Scope

### ✅ In-Scope Features

- AI-powered flashcard generation (1–3 cards per 1,000 characters)
- Manual creation, editing, and deletion of flashcards (front ≤200 chars, back ≤500 chars)
- Interactive review sessions using the SM2 spaced repetition algorithm
- User accounts: registration, login, password reset & change
- Real-time UI validation and clear error messages
- Accessibility compliant (WCAG AA)
- Telemetry of `generatedCount` and `savedCount`

### ⚠️ Out-Of-Scope

- Advanced/custom SM-2 or other SRS algorithms
- Importing from PDF, DOCX, etc.
- Sharing flashcard sets between users
- Mobile-specific application
- Flashcard deduplication or version history
- Backend validation of input text length
- Email confirmation on registration

## Project Status

- **Version**: 0.0.2
- **Status**: Early development (alpha)

## License

This project is licensed under the [MIT](https://opensource.org/licenses/MIT) License.
