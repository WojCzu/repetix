import type { GenerationCandidateDto } from "../../types";

export class AIService {
  /**
   * Generates flashcard candidates from input text using AI
   * Currently returns mocked data
   * @param text - Raw input text to analyze
   * @returns Array of front/back text pairs
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async generateFlashcards(text: string): Promise<GenerationCandidateDto[]> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return [
      {
        front_text: "What is the main concept discussed in the text?",
        back_text: "This is a mock response demonstrating the flashcard format.",
      },
      {
        front_text: "How does this help with learning?",
        back_text: "It provides structured question-answer pairs for effective revision.",
      },
      {
        front_text: "What is the purpose of this text?",
        back_text: "To demonstrate mock AI-generated flashcards for learning purposes.",
      },
    ];
  }
}
