import { expect, test } from "@playwright/test";
import { start, stop } from "@admin/e2e/mocks/trpc";
import { init } from "api/server";
import { prisma } from "api/prisma/client";

const NAME = "John";
const LAST_NAME = "Doe";
const EMAIL = "johndoe@domain.com";
const PASSWORD = "Zaq1@wsx";

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
	await page.waitForURL(/\/admin\/auth\/signup/);
	await page.click("button[type=submit]");
	expect(await page.locator("text=Pole wymagane!").count()).toBe(5);
	await expect(page).toHaveScreenshot();
});

test("shows error when email invalid", async ({ page }) => {
	await page.goto("/admin/auth/signup");
	await page.locator("input[type='email']").type("invalid@domain");

	await expect(page.locator("text=Niepoprawny adres e-mail!")).toBeVisible();
});

test("shows error when password invalid", async ({ page }) => {
	await page.goto("/admin/auth/signup");
	await page.locator("input[type='password']").first().type("password");

	await expect(
		page.locator(
			"text=Hasło musi mieć minimum 8 znaków, jedną wielką literę, oraz jedną cyfrę!"
		)
	).toBeVisible();
});

test("shows error when passwords don't match", async ({ page }) => {
	await page.goto("/admin/auth/signup");
	await page.locator("input[type='password']").nth(1).type("password");

	await expect(page.locator("text=Hasła nie są identyczne!")).toBeVisible();
});

test("signs up when info is valid", async ({ page }) => {
	await page.goto("/admin/auth/signup");
	await page.waitForURL(/\/admin\/auth\/signup/);

	await page.locator("input[type='email']").type(EMAIL);
	await page.locator("input[type='text']").first().type(NAME);
	await page.locator("input[type='text']").nth(1).type(LAST_NAME);
	await page.locator("input[type='password']").first().type(PASSWORD);
	await page.locator("input[type='password']").nth(1).type(PASSWORD);
	await page.locator("button[type=submit]").click();

	await page.waitForURL(/\/admin\/dashboard/);
	expect(page.url()).toMatch(/\/admin\/dashboard/);
});
