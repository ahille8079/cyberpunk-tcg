import { test, expect } from "@playwright/test";

test.describe("Deck Builder", () => {
  test("can create a new deck with legends and cards", async ({ page }) => {
    await page.goto("/decks/new");

    // Type a deck name
    const nameInput = page.getByTestId("deck-name-input");
    await nameInput.fill("My Test Deck");
    await expect(nameInput).toHaveValue("My Test Deck");

    // Pick 3 legends from the legend picker
    const legendPicker = page.getByTestId("legend-picker");
    const legendButtons = legendPicker.locator("button:not([disabled])");
    await legendButtons.nth(0).click();
    await legendButtons.nth(1).click();
    await legendButtons.nth(2).click();

    // Verify the legend counter shows 3/3
    await expect(page.getByTestId("legend-counter")).toContainText("3/3");

    // Add some cards from the card grid
    const cardGrid = page.getByTestId("card-grid");
    const cards = cardGrid.locator("[data-testid^='card-']");
    await cards.nth(0).click();
    await cards.nth(1).click();
    await cards.nth(2).click();

    // The deck card list should now show entries
    await expect(page.getByTestId("deck-card-list")).toBeVisible();
  });

  test("can clear a deck after adding cards", async ({ page }) => {
    await page.goto("/decks/new");

    // Add a legend
    const legendPicker = page.getByTestId("legend-picker");
    const legendButtons = legendPicker.locator("button:not([disabled])");
    await legendButtons.nth(0).click();
    await expect(page.getByTestId("legend-counter")).toContainText("1/3");

    // Click "Clear" to reset
    await page.getByTestId("clear-deck-btn").click();

    // Legends should be reset to 0/3
    await expect(page.getByTestId("legend-counter")).toContainText("0/3");
  });

  test("deck list page loads and shows New Deck button", async ({ page }) => {
    await page.goto("/decks");

    // Should see the "My Decks" heading
    await expect(page.getByText("My Decks")).toBeVisible();

    // Should see the "New Deck" button
    await expect(page.getByTestId("new-deck-btn")).toBeVisible();
  });

  test("New Deck button navigates to deck builder", async ({ page }) => {
    await page.goto("/decks");

    await page.getByTestId("new-deck-btn").click();

    // Should be on the new deck page
    await expect(page).toHaveURL(/\/decks\/new/);
    await expect(page.getByTestId("deck-name-input")).toBeVisible();
  });
});
