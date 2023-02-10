import { expect, test } from "@playwright/test";
import { start, stop } from "@admin/e2e/mocks/trpc";
import { init } from "api/server";
import { prisma } from "api/prisma/client";

const NAME = "John";
const LAST_NAME = "Doe";
const EMAIL = "johndoe@domain.com";
const PASSWORD = "Zaq1@wsx";

test.beforeAll(async () => {
	await prisma.users.deleteMany();
	await start(await init());
});
test.afterAll(async () => {
	await stop();
});

test("visual comparison", async ({ page }) => {
	await page.goto("/admin/auth/signin");
	await page.waitForURL(/\/admin\/auth\/signup/);
	await expect(page).toHaveScreenshot();
});

test("shows 'field required' errors", async ({ page }) => {
	await page.goto("/admin/auth/signin");
	await page.waitForURL(/\/admin\/auth\/signup/);
	await page.click("button[type=submit]");
	expect(await page.locator("text=Pole wymagane!").count()).toBe(5);
	await expect(page).toHaveScreenshot();
});

test("shows error when email invalid", async ({ page }) => {
	await page.goto("/admin/auth/signin");
	await page.locator("input[type='email']").fill("invalid@domain");

	await expect(page.locator("text=Niepoprawny adres e-mail!")).toBeVisible();
});

test("shows error when password invalid", async ({ page }) => {
	await page.goto("/admin/auth/signin");
	await page.locator("input[type='password']").first().fill("password");

	await expect(
		page.locator(
			"text=Hasło musi mieć minimum 8 znaków, jedną wielką literę, oraz jedną cyfrę!"
		)
	).toBeVisible();
});

test("shows error when passwords don't match", async ({ page }) => {
	await page.goto("/admin/auth/signin");
	await page.locator("input[type='password']").nth(1).fill("password");

	await expect(page.locator("text=Hasła nie są identyczne!")).toBeVisible();
});

test("signs up when info is valid", async ({ page }) => {
	await page.goto("/admin/auth/signup");
	await page.waitForURL(/\/admin\/auth\/signup/);

	await page.locator("input[type='email']").fill(EMAIL);
	await page.locator("input[type='text']").first().fill(NAME);
	await page.locator("input[type='text']").nth(1).fill(LAST_NAME);
	await page.locator("input[type='password']").first().fill(PASSWORD);
	await page.locator("input[type='password']").nth(1).fill(PASSWORD);
	await page.locator("button[type=submit]").click();

	await page.waitForURL(/\/admin\/dashboard/);
	expect(page.url()).toMatch(/\/admin\/dashboard/);
});
