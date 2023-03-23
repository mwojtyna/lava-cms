import { expect } from "@playwright/test";
import { start, stop } from "@admin/e2e/mocks/trpc";
import bcrypt from "bcrypt";
import { init } from "api/server";
import { prisma } from "api/prisma/client";
import { test } from "@admin/e2e/fixtures";

const NAME = "John";
const LAST_NAME = "Doe";
const EMAIL = "johndoe@domain.com";
const PASSWORD = "Zaq1@wsx";

test.describe("sign up step", () => {
	test.beforeAll(async () => {
		await prisma.user.deleteMany();
		await start(await init());
	});
	test.afterAll(async () => {
		await stop();
		await prisma.user.deleteMany();
	});

	test("visual comparison", async ({ page }) => {
		await page.goto("/admin/auth/signup");
		await page.waitForURL(/\/admin\/auth\/signup/);
		await expect(page).toHaveScreenshot();
	});

	test("shows 'field required' errors", async ({ page }) => {
		await page.goto("/admin/auth/signup");
		await page.click("button[type=submit]");
		await expect(page).toHaveScreenshot();
	});

	test("shows error when email invalid", async ({ page }) => {
		await page.goto("/admin/auth/signup");
		await page.locator("input[type='email']").type("invalid@domain");
		await page.locator("button[type=submit]").click();

		await expect(page.locator("text=The e-mail you provided is invalid.")).toBeVisible();
	});

	test("shows error when password invalid", async ({ page }) => {
		await page.goto("/admin/auth/signup");

		await page.locator("button[type=submit]").click();
		const passwordField = page.locator("input[type='password']").first();

		passwordField.first().fill("pass");
		await expect(
			page.locator("text=The password must be at least 8 characters long.")
		).toBeVisible();

		passwordField.first().fill("12345678");
		await expect(
			page.locator("text=The password must contain at least one lowercase letter.")
		).toBeVisible();

		passwordField.first().fill("password");
		await expect(
			page.locator("text=The password must contain at least one uppercase letter.")
		).toBeVisible();

		passwordField.first().fill("Password");
		await expect(
			page.locator("text=The password must contain at least one digit.")
		).toBeVisible();
	});

	test("shows error when passwords don't match", async ({ page }) => {
		await page.goto("/admin/auth/signup");

		await page.locator("button[type=submit]").click();
		await page.locator("input[type='password']").nth(1).type("password");

		await expect(page.locator("text=The passwords do not match.")).toBeVisible();
	});

	test("goes to the next step when info is valid", async ({ page }) => {
		await page.goto("/admin/auth/signup");

		await page.locator("input[type='email']").type(EMAIL);
		await page.locator("input[type='text']").first().type(NAME);
		await page.locator("input[type='text']").nth(1).type(LAST_NAME);
		await page.locator("input[type='password']").first().type(PASSWORD);
		await page.locator("input[type='password']").nth(1).type(PASSWORD);
		await page.locator("button[type=submit]").click();
		await page.waitForURL(/\/auth\/signup/);

		expect(page.url()).toMatch(/\/auth\/signup/);
		await expect(page.locator("h1").first()).toHaveText("Setup website");
	});
});

test.describe("setup website step", () => {
	test.beforeAll(async () => {
		await prisma.user.create({
			data: {
				name: NAME,
				last_name: LAST_NAME,
				email: EMAIL,
				password: await bcrypt.hash(PASSWORD, 10),
			},
		});
		await prisma.config.deleteMany();

		await start(await init());
	});
	test.afterAll(async () => {
		await stop();
		await prisma.user.deleteMany();
		await prisma.config.deleteMany();
	});

	test("visual comparison", async ({ page }) => {
		await page.goto("/admin/auth/signup");
		await expect(page).toHaveScreenshot();
	});

	test("shows 'field required' errors", async ({ page }) => {
		await page.goto("/admin/auth/signup");
		await page.click("button[type=submit]");
		await expect(page).toHaveScreenshot();
	});

	test("shows error when language code invalid", async ({ page }) => {
		await page.goto("/admin/auth/signup");

		const languageInput = page.locator("input[type='text']").nth(1);
		await languageInput.type("invalid");

		await expect(languageInput).toHaveAttribute("aria-invalid", "true");
	});

	test("go to dashboard when info is valid", async ({ authedPage }) => {
		// authedPage fixture automatically creates a config
		// we don't want that for this test because if it exists
		// then it will redirect to /dashboard
		await prisma.config.deleteMany();

		await authedPage.goto("/admin/auth/signup");
		await authedPage.locator("input[type='text']").first().type("My website");
		await authedPage.locator("input[type='text']").nth(1).type("en");
		await authedPage.locator("button[type=submit]").click();
		await authedPage.waitForURL(/\/dashboard/);

		expect(authedPage.url()).toMatch(/\/dashboard/);
		await expect(authedPage.locator("#content").first()).toBeVisible();
	});
});
