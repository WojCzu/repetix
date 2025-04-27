# Repetix

A web application for fast creation and management of flashcards using spaced repetition, powered by AI and a simple review workflow.

## Table of Contents

1. [Project Description](#project-description)  
2. [Tech Stack](#tech-stack)  
3. [Getting Started Locally](#getting-started-locally)  
4. [Available Scripts](#available-scripts)  
5. [Project Scope](#project-scope)  
6. [Project Status](#project-status)  
7. [License](#license)  

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

| Script       | Description                            |
|--------------|----------------------------------------|
| `npm run dev`       | Start Astro development server        |
| `npm run build`     | Build production assets              |
| `npm run preview`   | Preview the production build locally |
| `npm run astro`     | Run the Astro CLI                    |
| `npm run lint`      | Lint all source files with ESLint    |
| `npm run lint:fix`  | Lint & auto-fix problems             |
| `npm run format`    | Format code with Prettier            |

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

- **Version**: 0.0.1  
- **Status**: Early development (alpha)  

## License

This project is licensed under the [MIT](https://opensource.org/licenses/MIT) License.
