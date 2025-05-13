import { test } from "@playwright/test";
import { HomePage } from "../page-objects/home.po";

test.describe("Home Page", () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate();
  });
});
