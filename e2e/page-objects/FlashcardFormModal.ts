import { type Page, type Locator, expect } from "@playwright/test";

export class FlashcardFormModal {
  readonly page: Page;
  readonly dialog: Locator;
  readonly title: Locator;
  readonly form: Locator;
  readonly frontTextInput: Locator;
  readonly backTextInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly frontError: Locator;
  readonly backError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByTestId("flashcard-form-modal");
    this.title = page.getByTestId("flashcard-form-title");
    this.form = page.getByTestId("flashcard-form");
    this.frontTextInput = page.getByTestId("front-text-input");
    this.backTextInput = page.getByTestId("back-text-input");
    this.submitButton = page.getByTestId("submit-button");
    this.cancelButton = page.getByTestId("cancel-button");
    this.frontError = page.locator("#front-error");
    this.backError = page.locator("#back-error");
  }

  /**
   * Fills the form with the given front and back text
   */
  async fillForm(frontText: string, backText: string) {
    await this.frontTextInput.fill(frontText);
    await this.backTextInput.fill(backText);
  }

  /**
   * Submits the form
   */
  async submit() {
    await this.submitButton.click();
    await expect(this.dialog).not.toBeVisible();
  }

  /**
   * Cancels the form
   */
  async cancel() {
    await this.cancelButton.click();
    await expect(this.dialog).not.toBeVisible();
  }

  /**
   * Validates if the form is in add mode
   */
  async expectAddMode() {
    await expect(this.title).toHaveText("Add New Flashcard");
    await expect(this.submitButton).toHaveText("Add Flashcard");
  }

  /**
   * Validates if the form is in edit mode
   */
  async expectEditMode() {
    await expect(this.title).toHaveText("Edit Flashcard");
    await expect(this.submitButton).toHaveText("Save Changes");
  }

  /**
   * Validates if the submit button is enabled/disabled based on form state
   */
  async expectSubmitButtonState(enabled: boolean) {
    if (enabled) {
      await expect(this.submitButton).toBeEnabled();
    } else {
      await expect(this.submitButton).toBeDisabled();
    }
  }

  /**
   * Gets validation error messages if present
   */
  async getValidationErrors() {
    const frontError = await this.frontError.textContent();
    const backError = await this.backError.textContent();
    return { frontError, backError };
  }
}
