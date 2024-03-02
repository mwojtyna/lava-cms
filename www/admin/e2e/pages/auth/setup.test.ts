import { expect } from "@playwright/test";
import { test } from "@/e2e/fixtures";
import {
	createMockUser,
	deleteMockUser,
	userMock,
	userPasswordDecrypted,
	seoSettingsMock,
} from "@/e2e/mocks";
import { prisma } from "@/prisma/client";

test.describe("sign up step", () => {
	test.afterAll(async () => {
		await deleteMockUser();
	});

	test("light theme visual comparison", async ({ page }) => {
		await page.emulateMedia({ colorScheme: "light" });
		await page.goto("/admin/setup");
		await expect(page).toHaveScreenshot();
	});
	test("dark theme visual comparison", async ({ page }) => {
		await page.emulateMedia({ colorScheme: "dark" });
		await page.goto("/admin/setup");
		await expect(page).toHaveScreenshot();
	});

	test("shows 'field required' errors", async ({ page }) => {
		await page.goto("/admin/setup");
		await page.click("button[type='submit']");
		await expect(page).toHaveScreenshot();
	});

	test("shows error when email invalid", async ({ page }) => {
		await page.goto("/admin/setup");
		await page.locator("input[type='email']").type("invalid@domain");
		await page.locator("button[type='submit']").click();

		await expect(page.locator("text=The e-mail you provided is invalid.")).toBeInViewport();
	});

	test("shows error when password invalid", async ({ page }) => {
		await page.goto("/admin/setup");

		await page.locator("button[type='submit']").click();
		const passwordField = page.locator("input[type='password']").first();

		await passwordField.first().fill("pass");
		await expect(
			page.locator("text=The password must be at least 8 characters long."),
		).toBeInViewport();

		await passwordField.first().fill("12345678");
		await expect(
			page.locator("text=The password must contain at least one lowercase letter."),
		).toBeInViewport();

		await passwordField.first().fill("password");
		await expect(
			page.locator("text=The password must contain at least one uppercase letter."),
		).toBeInViewport();

		await passwordField.first().fill("Password");
		await expect(
			page.locator("text=The password must contain at least one digit."),
		).toBeInViewport();

		await passwordField.first().fill("Password1");
		await expect(page.locator("input[type='password']").first()).toHaveAttribute(
			"aria-invalid",
			"false",
		);
	});

	test("shows error when passwords don't match", async ({ page }) => {
		await page.goto("/admin/setup");

		await page.locator("button[type='submit']").click();
		await page.locator("input[type='password']").nth(1).type("password");

		await expect(page.locator("text=The passwords do not match.")).toBeInViewport();
	});

	test("goes to the next step when info is valid", async ({ page }) => {
		await page.goto("/admin/setup");

		await page.locator("input[type='email']").type(userMock.email);
		await page.locator("input[type='text']").first().type(userMock.name);
		await page.locator("input[type='text']").nth(1).type(userMock.last_name);
		await page.locator("input[type='password']").first().type(userPasswordDecrypted);
		await page.locator("input[type='password']").nth(1).type(userPasswordDecrypted);
		await page.locator("button[type='submit']").click();

		await page.waitForSelector("text='Set up website'");
		await expect(page.getByTestId("setup-form")).toBeInViewport();
		expect(page.url()).toMatch(/\/admin\/setup/);
	});
});

test.describe("setup website step", () => {
	test.beforeAll(async () => {
		await createMockUser();
	});
	test.afterAll(async () => {
		await deleteMockUser();
		await prisma.settingsSeo.deleteMany();
		await prisma.page.deleteMany();
		await prisma.componentDefinitionGroup.deleteMany();
		await prisma.settingsConnection.deleteMany();
	});

	test("light theme visual comparison", async ({ page }) => {
		await page.emulateMedia({ colorScheme: "light" });
		await page.goto("/admin/setup");
		await expect(page).toHaveScreenshot();
	});
	test("dark theme visual comparison", async ({ page }) => {
		await page.emulateMedia({ colorScheme: "dark" });
		await page.goto("/admin/setup");
		await expect(page).toHaveScreenshot();
	});

	test("shows 'field required' errors", async ({ page }) => {
		await page.goto("/admin/setup");
		await page.click("button[type='submit']");
		await expect(page).toHaveScreenshot();
	});

	test("shows error when language code invalid", async ({ authedPage: page }) => {
		// authedPage fixture automatically creates a config and a Root page
		// we don't want that for this test because if it exists
		// then it will redirect to /dashboard
		await prisma.settingsSeo.deleteMany();
		await prisma.page.deleteMany();

		await page.goto("/admin/setup");
		await page.base.locator("input[type='text']").first().type(seoSettingsMock.title);

		const languageInput = page.base.locator("input[type='text']").nth(1);
		await languageInput.type("invalid");
		await page.base.locator("button[type='submit']").click();

		await expect(languageInput).toHaveAttribute("aria-invalid", "true");
	});

	test("go to dashboard when info is valid", async ({ authedPage: page }) => {
		// authedPage fixture automatically creates a config and a Root page
		// we don't want that for this test because if it exists
		// then it will redirect to /dashboard
		await prisma.settingsSeo.deleteMany();
		await prisma.page.deleteMany();

		await page.goto("/admin/setup");
		await page.base.locator("input[type='text']").first().type(seoSettingsMock.title);
		await page.base.locator("input[type='text']").nth(1).type(seoSettingsMock.language);
		await page.base.locator("button[type='submit']").click();
		await page.base.waitForURL(/dashboard/);

		expect(page.base.url()).toMatch(/dashboard/);
		await expect(page.base.locator("#content").first()).toBeInViewport();
		await expect(prisma.settingsSeo.findFirstOrThrow()).resolves.toMatchObject({
			title: seoSettingsMock.title,
			description: "",
			language: seoSettingsMock.language,
		} satisfies typeof seoSettingsMock);
	});
});
