import { test as setup } from "@playwright/test";
import { LoginPage } from "./page-objects/LoginPage";
import path from "path";

const authFile = path.join(process.cwd(), "e2e/.auth/user.json");

setup("authenticate", async ({ page }) => {
  // Sprawdź czy zmienne środowiskowe są ustawione
  const username = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;

  if (!username || !password) {
    throw new Error("Missing required environment variables: E2E_USERNAME and/or E2E_PASSWORD");
  }

  // Użyj Page Object Model do logowania
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillCredentials(username, password);
  await loginPage.submit();

  // Poczekaj na zalogowanie i przekierowanie
  await loginPage.waitForLoginProcess();

  // Zapisz stan autentykacji
  await page.context().storageState({ path: authFile });
});
