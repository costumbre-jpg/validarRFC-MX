import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Maflipp/i);
  await expect(page.getByText("Validación RFC", { exact: false })).toBeVisible();
});
