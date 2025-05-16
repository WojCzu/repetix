import { type Page, type Locator, expect } from "@playwright/test";
import { FlashcardFormModal } from "./FlashcardFormModal";

export class FlashcardsPage {
  readonly page: Page;
  readonly addButton: Locator;
  readonly flashcardsList: Locator;
  readonly sourceFilter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addButton = page.getByTestId("add-flashcard-button");
    this.flashcardsList = page.getByTestId("flashcards-list");
    this.sourceFilter = page.getByRole("combobox", { name: "Filter by source" });
  }

  /**
   * Waits for the page to be ready
   */
  async waitForReady() {
    await this.addButton.waitFor();
    await this.flashcardsList.waitFor();
  }

  /**
   * Opens the add flashcard modal
   */
  async openAddFlashcardModal() {
    await this.addButton.click();
    return new FlashcardFormModal(this.page);
  }

  /**
   * Opens edit modal for a specific flashcard
   */
  async openEditFlashcardModal(frontText: string) {
    const flashcard = await this.findFlashcardByFrontText(frontText);
    await flashcard?.getByTestId("edit-button").click();
    return new FlashcardFormModal(this.page);
  }

  /**
   * Deletes a flashcard and confirms the action
   */
  async deleteFlashcard(frontText: string) {
    const flashcard = await this.findFlashcardByFrontText(frontText);
    await flashcard?.getByTestId("delete-button").click();

    // Confirm deletion in the modal
    await this.page.getByRole("button", { name: "Confirm" }).click();

    // Wait for success message
    await expect(this.page.getByText("Flashcard deleted successfully")).toBeVisible();
  }

  /**
   * Finds a flashcard by its front text
   */
  async findFlashcardByFrontText(frontText: string) {
    return this.flashcardsList.getByTestId("flashcard-item").filter({ hasText: frontText }).first();
  }

  /**
   * Checks if a flashcard exists with given front and back text
   */
  async expectFlashcardExists(frontText: string, backText: string) {
    const flashcard = await this.findFlashcardByFrontText(frontText);
    await expect(flashcard).toBeVisible();
    await expect(flashcard).toContainText(backText);
  }

  /**
   * Checks if a flashcard does not exist
   */
  async expectFlashcardNotExists(frontText: string) {
    const flashcard = await this.findFlashcardByFrontText(frontText);
    await expect(flashcard).toHaveCount(0);
  }

  /**
   * Filters flashcards by source
   */
  async filterBySource(source: "all" | "manual" | "ai-full" | "ai-edited") {
    await this.sourceFilter.click();
    await this.page.getByRole("option", { name: source === "all" ? "All Sources" : source }).click();
  }
}
