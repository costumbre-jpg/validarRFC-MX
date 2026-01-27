import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Maflipp/i);
  await expect(
    page.getByRole("heading", { name: /Validación de RFCs contra el SAT/i })
  ).toBeVisible();
});

test("pricing page loads", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page.getByRole("heading", { name: "Planes y Precios" })).toBeVisible();
});

test("developers docs load", async ({ page }) => {
  await page.goto("/developers");
  await expect(page.getByText("Documentación de la API", { exact: false })).toBeVisible();
});

test("dashboard redirects to login when unauthenticated", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/auth\/login/);
});
