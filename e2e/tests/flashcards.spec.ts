import { test, expect } from "@playwright/test";
import { FlashcardsPage } from "../page-objects/FlashcardsPage";

test.describe("Flashcards Management", () => {
  let flashcardsPage: FlashcardsPage;

  test.beforeEach(async ({ page }) => {
    flashcardsPage = new FlashcardsPage(page);
    await page.goto("/flashcards");
    await flashcardsPage.waitForReady();
  });

  test("should create a new flashcard", async () => {
    // Given: Prepare unique flashcard content with timestamp
    const timestamp = new Date().toISOString().slice(11, 19); // HH:mm:ss
    const frontText = `What is the capital of France? [${timestamp}]`;
    const backText = `Paris is the capital and largest city of France. [${timestamp}]`;

    // When: Opening the add flashcard modal
    const modal = await flashcardsPage.openAddFlashcardModal();

    // Then: Modal should be in add mode
    await modal.expectAddMode();

    // When: Filling the form with valid data
    await modal.fillForm(frontText, backText);

    // Then: Submit button should be enabled
    await modal.expectSubmitButtonState(true);

    // When: Submitting the form
    await modal.submit();

    // Then: Success message should be visible
    await expect(flashcardsPage.page.getByText("Flashcard created successfully")).toBeVisible();

    // And: Flashcard should appear in the list
    await flashcardsPage.expectFlashcardExists(frontText, backText);
  });

  test("should validate form inputs", async () => {
    // When: Opening the add flashcard modal
    const modal = await flashcardsPage.openAddFlashcardModal();

    // Then: Submit should be disabled when form is empty
    await modal.expectSubmitButtonState(false);

    // When: Filling only front text
    await modal.fillForm("a", "");

    // Then: Submit should still be disabled (back text required)
    await modal.expectSubmitButtonState(false);

    // When: Filling only back text
    await modal.fillForm("", "b");

    // Then: Submit should still be disabled (front text required)
    await modal.expectSubmitButtonState(false);

    // When: Filling both fields with valid text
    await modal.fillForm("test", "answer");

    // Then: Submit should be enabled
    await modal.expectSubmitButtonState(true);

    // When: Entering and removing text from both fields
    await modal.fillForm("", "");

    // Then: Should show validation errors about required fields
    const errors = await modal.getValidationErrors();
    expect(errors.frontError).toBe("Front text is required");
    expect(errors.backError).toBe("Back text is required");
  });

  test("should edit an existing flashcard", async () => {
    // Given: Create a flashcard to edit
    const timestamp = new Date().toISOString().slice(11, 19);
    const originalFront = `Original Question [${timestamp}]`;
    const originalBack = `Original Answer [${timestamp}]`;

    const addModal = await flashcardsPage.openAddFlashcardModal();
    await addModal.fillForm(originalFront, originalBack);
    await addModal.submit();

    // When: Opening the edit modal
    const editModal = await flashcardsPage.openEditFlashcardModal(originalFront);

    // Then: Modal should be in edit mode
    await editModal.expectEditMode();

    // When: Modifying the flashcard
    const editedFront = `Edited Question [${timestamp}]`;
    const editedBack = `Edited Answer [${timestamp}]`;
    await editModal.fillForm(editedFront, editedBack);

    // Then: Submit button should be enabled
    await editModal.expectSubmitButtonState(true);

    // When: Saving the changes
    await editModal.submit();

    // Then: Success message should be visible
    await expect(flashcardsPage.page.getByText("Flashcard updated successfully")).toBeVisible();

    // And: Edited flashcard should appear in the list
    await flashcardsPage.expectFlashcardExists(editedFront, editedBack);

    // And: Original flashcard should not exist
    await flashcardsPage.expectFlashcardNotExists(originalFront);
  });

  test("should delete a flashcard", async () => {
    // Given: Create a flashcard to delete
    const timestamp = new Date().toISOString().slice(11, 19);
    const frontText = `To Delete [${timestamp}]`;
    const backText = `Will be deleted [${timestamp}]`;

    const modal = await flashcardsPage.openAddFlashcardModal();
    await modal.fillForm(frontText, backText);
    await modal.submit();

    // When: Deleting the flashcard
    await flashcardsPage.deleteFlashcard(frontText);

    // Then: Flashcard should not exist anymore
    await flashcardsPage.expectFlashcardNotExists(frontText);
  });

  test("should cancel adding new flashcard", async () => {
    // Given: Prepare unique flashcard content with timestamp
    const timestamp = new Date().toISOString().slice(11, 19);
    const frontText = `Test front [${timestamp}]`;
    const backText = `Test back [${timestamp}]`;

    // When: Opening the add flashcard modal
    const modal = await flashcardsPage.openAddFlashcardModal();

    // And: Filling the form
    await modal.fillForm(frontText, backText);

    // And: Clicking cancel
    await modal.cancel();

    // Then: Modal should be closed
    await expect(modal.dialog).not.toBeVisible();

    // And: Flashcard should not appear in the list
    await flashcardsPage.expectFlashcardNotExists(frontText);
  });
});
