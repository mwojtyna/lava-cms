import { expect } from "@playwright/test";
import { test } from "@admin/e2e/fixtures";
import { connectionSettingsMock } from "@admin/e2e/mocks";

const TEST_ID = "connection-form";

test("visual comparison", async ({ authedPage: page }) => {
	await page.goto("/admin/dashboard/settings/connection");
	await expect(page.base.getByTestId(TEST_ID)).toHaveScreenshot();
});

test("copies token into clipboard and changes into check mark", async ({
	authedPage: page,
	browserName,
	headless,
}) => {
	await page.goto("/admin/dashboard/settings/connection");

	const copyButton = page.base.getByTestId(TEST_ID).getByRole("button").first();
	const icon = await copyButton.locator("svg").innerHTML();
	await copyButton.click();

	// Firefox doesn't implement clipboard.readText() API (which we use for checking if token was copied),
	// Webkit throws permission error when headless
	if (browserName === "chromium" || (browserName === "webkit" && !headless)) {
		expect(await page.base.evaluate(async () => await navigator.clipboard.readText())).toBe(
			connectionSettingsMock.token,
		);
	}
	expect(icon).not.toBe(await copyButton.locator("svg").innerHTML());
});

test("regenerates token", async ({ authedPage: page }) => {
	await page.goto("/admin/dashboard/settings/connection");

	const tokenInput = page.base.getByTestId(TEST_ID).locator("input[type='text']").first();
	const token = await tokenInput.inputValue();

	const regenerateButton = page.base.getByTestId(TEST_ID).getByRole("button").nth(1);
	await regenerateButton.click();
	await page.base.waitForResponse("**/api/private/auth.getToken**");

	expect(await tokenInput.inputValue()).not.toBe(token);
	await expect(page.base.locator("li[role='status']")).toContainText("Success");
});
