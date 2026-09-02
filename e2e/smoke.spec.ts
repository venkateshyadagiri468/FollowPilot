import { test, expect } from "@playwright/test";

test.describe("FollowPilot Smoke Test Suite", () => {
  test("Landing page loads with dark obsidian theme & pricing cards", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/FollowPilot/i);

    // Verify Hero Header
    const heroHeading = page.locator("h1");
    await expect(heroHeading).toBeVisible();

    // Verify Pricing Cards Section
    const pricingSection = page.locator("#pricing");
    await expect(pricingSection).toBeVisible();
  });

  test("Dashboard page renders application shell and sidebar", async ({ page }) => {
    await page.goto("/dashboard");

    // Verify Action Queue Workspace Title
    const workspaceHeading = page.locator("h1");
    await expect(workspaceHeading).toContainText("Sales Action Workspace");

    // Verify Sidebar navigation items
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();
  });
});
