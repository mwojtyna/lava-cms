import { expect, test } from "@playwright/test";
import bcrypt from "bcrypt";
import { start, stop } from "@admin/e2e/mocks/trpc";
import { init } from "api/server";
import { prisma } from "api/prisma/client";

const EMAIL = "johndoe@domain.com";
const PASSWORD = "password";

test.beforeAll(async () => {
	await prisma.users.create({
		data: {
			name: "John",
			last_name: "Doe",
			email: EMAIL,
			password: await bcrypt.hash(PASSWORD, 10),
		},
	});

	await start(await init());
});
test.afterAll(async () => {
	await stop();
	await prisma.users.delete({
		where: {
			email: EMAIL,
		},
	});
});

test("visual comparison", async ({ page }) => {
	await page.goto("/admin/auth/signin");
	await page.waitForURL(/\/admin\/auth\/signin/);
	await expect(page).toHaveScreenshot();
});

test("shows 'field required' errors", async ({ page }) => {
	await page.goto("/admin/auth/signin");
	await page.click("button[type=submit]");
	expect(await page.locator("text=Pole wymagane!").count()).toBe(2);
	await expect(page).toHaveScreenshot();
});

test("shows error when invalid credentials", async ({ page }) => {
	await page.goto("/admin/auth/signin");

	// Wrong email
	await page.locator("input[type='email']").fill("wrong@email.com");
	await page.locator("input[type='password']").fill(PASSWORD);
	await page.locator("button[type='submit']").click();
	await page.waitForResponse(/\/api\/auth\/callback\/credentials/);
	await expect(page.getByRole("alert")).toContainText("Niepoprawne dane!");

	// Wrong password
	await page.locator("input[type='email']").fill(EMAIL);
	await page.locator("input[type='password']").fill("wrongpassword");
	await page.locator("button[type='submit']").click();
	await page.waitForResponse(/\/api\/auth\/callback\/credentials/);
	await expect(page.getByRole("alert")).toContainText("Niepoprawne dane!");

	// Both wrong
	await page.locator("input[type='email']").fill("wrong@email.com");
	await page.locator("input[type='password']").fill("wrongpassword");
	await page.locator("button[type='submit']").click();
	await page.waitForResponse(/\/api\/auth\/callback\/credentials/);
	await expect(page.getByRole("alert")).toContainText("Niepoprawne dane!");

	await expect(page).toHaveScreenshot();
});

test("shows error when server error", async ({ page }) => {
	await page.goto("/admin/auth/signin");
	await page.locator("input[type='email']").fill(EMAIL);
	await page.locator("input[type='password']").fill(PASSWORD);
	await stop();
	await page.locator("button[type='submit']").click();

	await expect(page.getByRole("alert")).toContainText("Nieznany błąd. Spróbuj ponownie później.");
	await expect(page).toHaveScreenshot();
});

test("shows error when email invalid", async ({ page }) => {
	await page.goto("/admin/auth/signin");
	await page.locator("input[type='email']").fill("invalid@domain");

	await expect(page.locator("text=Niepoprawny adres e-mail!")).toBeVisible();
});

test("signs in when credentials are valid", async ({ page }) => {
	await page.goto("/admin/auth/signin");
	await page.locator("input[type='email']").fill(EMAIL);
	await page.locator("input[type='password']").fill(PASSWORD);
	await page.locator("button[type='submit']").click();
	await page.waitForURL(/\/admin\/dashboard/);
});
