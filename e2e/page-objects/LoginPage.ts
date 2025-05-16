import { type Page, type Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;

  // Main containers
  readonly loginView: Locator;
  readonly loginForm: Locator;

  // Form inputs
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  // Error messages
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly submitError: Locator;

  // Navigation links
  readonly registerLink: Locator;
  readonly resetPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators using data-testid attributes
    this.loginView = page.getByTestId("login-view");
    this.loginForm = page.getByTestId("login-form");
    this.emailInput = page.getByTestId("email-input");
    this.passwordInput = page.getByTestId("password-input");
    this.submitButton = page.getByTestId("submit-button");
    this.emailError = page.getByTestId("email-error");
    this.passwordError = page.getByTestId("password-error");
    this.submitError = page.getByTestId("submit-error");
    this.registerLink = page.getByTestId("register-link");
    this.resetPasswordLink = page.getByTestId("reset-password-link");
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.page.goto("/login");
    // Poczekaj na pełne załadowanie formularza
    await this.emailInput.waitFor({ state: "visible" });
    await this.passwordInput.waitFor({ state: "visible" });
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Fill in login credentials
   */
  async fillCredentials(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await expect(this.passwordInput).toHaveValue(password);
  }

  /**
   * Submit login form
   */
  async submit() {
    // Upewnij się, że przycisk jest klikalny
    await this.submitButton.waitFor({ state: "visible" });
    await expect(this.submitButton).toBeEnabled();

    // Kliknij i poczekaj na request
    await Promise.all([
      this.page.waitForRequest((request) => request.url().includes("/api/auth") && request.method() === "POST"),
      this.submitButton.click(),
    ]);
  }

  /**
   * Complete login flow
   */
  async login(email: string, password: string) {
    await this.fillCredentials(email, password);
    await this.submit();
  }

  /**
   * Wait for login process to complete
   */
  async waitForLoginProcess() {
    // Poczekaj na odpowiedź z API
    await this.page.waitForResponse((response) => response.url().includes("/api/auth") && response.status() === 200);

    // Poczekaj na przekierowanie
    await this.page.waitForURL("/");
  }

  /**
   * Check if specific validation error is displayed
   */
  async hasValidationError(field: "email" | "password" | "submit"): Promise<boolean> {
    const errorLocator = {
      email: this.emailError,
      password: this.passwordError,
      submit: this.submitError,
    }[field];

    return await errorLocator.isVisible();
  }

  /**
   * Get validation error message
   */
  async getValidationError(field: "email" | "password" | "submit"): Promise<string | null> {
    const errorLocator = {
      email: this.emailError,
      password: this.passwordError,
      submit: this.submitError,
    }[field];

    if (await errorLocator.isVisible()) {
      return await errorLocator.textContent();
    }
    return null;
  }

  /**
   * Navigate to registration page
   */
  async goToRegister() {
    await this.registerLink.click();
  }

  /**
   * Navigate to password reset page
   */
  async goToResetPassword() {
    await this.resetPasswordLink.click();
  }
}
