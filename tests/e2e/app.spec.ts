import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("today, search, exercise logging, and personal history work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  await page.goto("/exercises");
  await page.getByRole("textbox", { name: "Search exercises" }).fill("wood chop");
  await expect(page.getByRole("heading", { name: "Cable Wood Chop" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Cable Wood Chop/ })).toHaveAttribute("href", "/exercises/cable-wood-chop");
  await page.goto("/exercises/cable-wood-chop");
  await expect(page.getByRole("heading", { name: "Cable Wood Chop", level: 1 })).toBeVisible();
  await expect(page.locator("figure img")).toHaveCount(2);
  await expect.poll(() => page.locator("figure img").evaluateAll((images) => images.every((image) => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
  await page.getByLabel("Weight or resistance").fill("25 kg");
  await page.getByLabel("Set 1 repetitions").fill("12");
  await page.getByRole("button", { name: "Save working sets" }).click();
  await expect(page.getByRole("button", { name: "Session saved" })).toBeVisible();
  await page.goto("/my-training");
  await expect(page.getByText("25 kg · 12 reps")).toBeVisible();
});

test("calendar journal plans a workout and preserves set-by-set progress", async ({ page }) => {
  await page.goto("/my-training");
  await expect(page.getByRole("heading", { name: "Training journal", level: 1 })).toBeVisible();
  await expect(page.getByRole("grid", { name: "Workout dates" })).toBeVisible();
  await page.getByRole("button", { name: /Upper A/ }).click();
  await expect(page.getByRole("heading", { name: "Upper A", exact: true })).toBeVisible();
  await expect(page.getByText("0/7 complete").first()).toBeVisible();

  await page.getByRole("button", { name: "Log sets" }).first().click();
  await page.getByRole("textbox", { name: "Working weight or resistance" }).fill("60 kg");
  await page.getByLabel("Machine Chest Press set 1 repetitions").fill("10");
  await page.getByLabel("Machine Chest Press set 2 repetitions").fill("9");
  await page.getByLabel("Machine Chest Press set 3 repetitions").fill("8");
  await page.getByRole("button", { name: "Save set log" }).click();
  await expect(page.getByText("1/7 complete").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Set log saved" })).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: "Edit set log" }).first().click();
  await expect(page.getByRole("textbox", { name: "Working weight or resistance" })).toHaveValue("60 kg");
  await expect(page.getByLabel("Machine Chest Press set 1 repetitions")).toHaveValue("10");
});

test("core pages have no serious accessibility violations", async ({ page }, testInfo) => {
  for (const path of ["/", "/exercises", "/exercises/machine-chest-press", "/workout/day-1", "/account"]) {
    await page.goto(path);
    await expect(page.getByText("Loading account")).toHaveCount(0);
    const results = await new AxeBuilder({ page }).disableRules(["color-contrast"]).analyze();
    expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? "")), `${path} accessibility violations on ${testInfo.project.name}`).toEqual([]);
  }
});

test("PWA manifest and offline worker are published", async ({ request }) => {
  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBe(true);
  expect((await manifest.json()).display).toBe("standalone");
  const worker = await request.get("/sw.js");
  expect(worker.ok()).toBe(true);
  expect(await worker.text()).toContain("PRECACHE");
});

test("account actions submit the authentication form", async ({ page }) => {
  await page.goto("/account");
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toHaveAttribute("type", "submit");
  await page.getByRole("tab", { name: "Create account" }).click();
  await expect(page.getByRole("button", { name: "Create account", exact: true })).toHaveAttribute("type", "submit");
});

test("a viewed exercise remains available offline", async ({ page, context }) => {
  await page.goto("/exercises/machine-chest-press");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Machine Chest Press", level: 1 })).toBeVisible();
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Machine Chest Press", level: 1 })).toBeVisible();
  await context.setOffline(false);
});

test("key layouts do not overflow supported viewports", async ({ page }) => {
  for (const width of [375, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/exercises", "/exercises/romanian-deadlift", "/my-training"]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${path} overflow at ${width}px`).toBeLessThanOrEqual(1);
    }
  }
});

test("mobile and desktop visual baselines", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot(`today-${testInfo.project.name}.png`, { fullPage: true, animations: "disabled", maxDiffPixelRatio: 0.02 });
});
