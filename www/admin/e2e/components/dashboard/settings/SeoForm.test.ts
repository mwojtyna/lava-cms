import { expect } from "@playwright/test";
import { test } from "@admin/e2e/fixtures";
import { websiteSettingsMock } from "@admin/e2e/mocks";
import { prisma } from "@admin/prisma/client";

const TEST_ID = "seo-form";

test("visual comparison", async ({ authedPage: page }) => {
	await page.goto("/admin/dashboard/settings");
	await expect(page.getByTestId(TEST_ID)).toHaveScreenshot();
});

test("website config displayed", async ({ authedPage: page }) => {
	await page.goto("/admin/dashboard/settings");

	const element = page.getByTestId(TEST_ID);
	await expect(element).toBeInViewport();
	await expect(element.locator("input[type='text']").first()).toHaveValue(
		websiteSettingsMock.title
	);
	await expect(element.locator("textarea")).toHaveValue(websiteSettingsMock.description);
	await expect(element.locator("input[type='text']").last()).toHaveValue(
		websiteSettingsMock.language
	);
});
test("website config updates", async ({ authedPage: page }) => {
	await page.goto("/admin/dashboard/settings");

	const element = page.getByTestId(TEST_ID);
	await element.locator("input[type='text']").first().fill("My new website");
	await element.locator("textarea").fill("My new website description");
	await element.locator("input[type='text']").last().fill("pl");
	await element.locator("button[type='submit']").click();

	await page.waitForResponse("**/api/private/config.getConfig**");

	const config = await prisma.config.findFirstOrThrow();
	expect(config.title).toBe("My new website");
	expect(config.description).toBe("My new website description");
	expect(config.language).toBe("pl");

	await expect(page.locator("li[role=status]")).toContainText("Success");
});

test("notification shows error when error occurs", async ({ authedPage: page }) => {
	await page.goto("/admin/dashboard/settings");

	await page.route("**/api/private/config.setConfig**", (route) =>
		route.fulfill({ status: 500 })
	);
	const element = page.getByTestId(TEST_ID);
	await element.locator("input[type='text']").first().fill("My new website");
	await element.locator("textarea").fill("My new website description");
	await element.locator("input[type='text']").last().fill("pl");
	await element.locator("button[type='submit']").click();

	await expect(page.locator("li[role=alert]")).toContainText("Error");
});
test("shows 'field required' errors", async ({ authedPage: page }) => {
	await page.goto("/admin/dashboard/settings");
	const element = page.getByTestId(TEST_ID);

	await element.locator("input[type='text']").first().clear();
	await element.locator("textarea").clear();
	await element.locator("input[type='text']").last().clear();
	await element.locator("button[type='submit']").click({ force: true });

	await expect(element.locator("input[type='text']").first()).toHaveAttribute(
		"aria-invalid",
		"true"
	);
	await expect(element.locator("input[type='text']").last()).toHaveAttribute(
		"aria-invalid",
		"true"
	);

	await expect(element).toHaveScreenshot();
});
test("shows error when language code invalid", async ({ authedPage: page }) => {
	await page.goto("/admin/dashboard/settings");

	const languageInput = page.locator("input[type='text']").nth(1);
	await languageInput.clear();
	await languageInput.type("invalid");
	await page.locator("button[type='submit']").click();

	await expect(languageInput).toHaveAttribute("aria-invalid", "true");
});
