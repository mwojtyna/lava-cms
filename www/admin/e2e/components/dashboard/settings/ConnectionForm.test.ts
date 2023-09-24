import { expect } from "@playwright/test";
import { test } from "@admin/e2e/fixtures";
import { tokenMock } from "@admin/e2e/mocks";

const TEST_ID = "connection-form";

test("visual comparison", async ({ authedPage: page }) => {
	await page.goto("/admin/dashboard/settings/connection", { waitUntil: "networkidle" });
	await expect(page.getByTestId(TEST_ID)).toHaveScreenshot();
});

test("copies token into clipboard and changes into check mark", async ({
	authedPage: page,
	browserName,
	headless,
}) => {
	await page.goto("/admin/dashboard/settings/connection", { waitUntil: "networkidle" });

	const copyButton = page.getByTestId(TEST_ID).getByRole("button").first();
	const icon = await copyButton.locator("svg").innerHTML();
	await copyButton.click();

	// Firefox doesn't implement clipboard.readText() API, Webkit throws error when headless
	if (browserName === "chromium" || (browserName !== "firefox" && !headless)) {
		expect(await page.evaluate(async () => await navigator.clipboard.readText())).toBe(
			tokenMock,
		);
	}
	expect(icon).not.toBe(await copyButton.locator("svg").innerHTML());
});

test("regenerates token", async ({ authedPage: page }) => {
	await page.goto("/admin/dashboard/settings/connection", { waitUntil: "networkidle" });

	const tokenInput = page.getByTestId(TEST_ID).locator("input[type='text']");
	const token = await tokenInput.inputValue();

	const regenerateButton = page.getByTestId(TEST_ID).getByRole("button").nth(1);
	await regenerateButton.click();
	await page.waitForResponse("**/api/private/auth.getToken**");

	expect(await tokenInput.inputValue()).not.toBe(token);
	await expect(page.locator("li[role='status']")).toContainText("Success");
});
