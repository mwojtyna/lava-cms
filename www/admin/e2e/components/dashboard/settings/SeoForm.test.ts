import { expect } from "@playwright/test";
import { test } from "@admin/e2e/fixtures";
import { seoSettingsMock } from "@admin/e2e/mocks";
import { prisma } from "@admin/prisma/client";

const TEST_ID = "seo-form";

test("visual comparison", async ({ authedPage: page }) => {
	await page.goto("/admin/dashboard/settings");
	await expect(page.base.getByTestId(TEST_ID)).toHaveScreenshot();
});

test("seo settings displayed", async ({ authedPage: page }) => {
	await page.goto("/admin/dashboard/settings");

	const element = page.base.getByTestId(TEST_ID);
	await expect(element).toBeInViewport();
	await expect(element.locator("input[type='text']").first()).toHaveValue(seoSettingsMock.title);
	await expect(element.locator("textarea")).toHaveValue(seoSettingsMock.description);
	await expect(element.locator("input[type='text']").last()).toHaveValue(
		seoSettingsMock.language,
	);
});
test("seo settings updates", async ({ authedPage: page }) => {
	await page.goto("/admin/dashboard/settings");

	const element = page.base.getByTestId(TEST_ID);
	await element.locator("input[type='text']").first().fill("My new website");
	await element.locator("textarea").fill("My new website description");
	await element.locator("input[type='text']").last().fill("pl");
	await element.locator("button[type='submit']").click();

	await page.base.waitForResponse("**/api/private/settings.getSeoSettings**");

	const seoSettings = await prisma.settingsSeo.findFirstOrThrow();
	expect(seoSettings.title).toBe("My new website");
	expect(seoSettings.description).toBe("My new website description");
	expect(seoSettings.language).toBe("pl");

	await expect(page.base.locator("li[role=status]")).toContainText("Success");
});

test("notification shows error when error occurs", async ({ authedPage: page }) => {
	await page.goto("/admin/dashboard/settings");

	await page.base.route("**/api/private/settings.getSeoSettings**", (route) =>
		route.fulfill({ status: 500 }),
	);
	const element = page.base.getByTestId(TEST_ID);
	await element.locator("input[type='text']").first().fill("My new website");
	await element.locator("textarea").fill("My new website description");
	await element.locator("input[type='text']").last().fill("pl");
	await element.locator("button[type='submit']").click();

	await expect(page.base.locator("li[role=alert]")).toContainText("Error");
});
test("shows 'field required' errors", async ({ authedPage: page }) => {
	await page.goto("/admin/dashboard/settings");
	const element = page.base.getByTestId(TEST_ID);

	await element.locator("input[type='text']").first().clear();
	await element.locator("textarea").clear();
	await element.locator("input[type='text']").last().clear();
	await element.locator("button[type='submit']").click({ force: true });

	await expect(element.locator("input[type='text']").first()).toHaveAttribute(
		"aria-invalid",
		"true",
	);
	await expect(element.locator("input[type='text']").last()).toHaveAttribute(
		"aria-invalid",
		"true",
	);

	await expect(element).toHaveScreenshot();
});
test("shows error when language code invalid", async ({ authedPage: page }) => {
	await page.goto("/admin/dashboard/settings");

	const languageInput = page.base.locator("input[type='text']").nth(1);
	await languageInput.clear();
	await languageInput.type("invalid");
	await page.base.locator("button[type='submit']").click();

	await expect(languageInput).toHaveAttribute("aria-invalid", "true");
});
