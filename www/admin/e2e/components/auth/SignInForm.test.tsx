import { expect, test } from "@playwright/test";
import bcrypt from "bcrypt";
import { start, stop } from "@admin/e2e/mocks/trpc";
import { init } from "api/server";
import { prisma } from "api/prisma/client";

const EMAIL = "johndoe@domain.com";
const PASSWORD = "password";

test.beforeAll(async () => {
	await prisma.user.create({
		data: {
			name: "John",
			last_name: "Doe",
			email: EMAIL,
			password: await bcrypt.hash(PASSWORD, 10),
		},
	});
});
test.afterAll(async () => {
	await prisma.user.deleteMany();
});

test.beforeEach(async () => {
	await start(await init());
});
test.afterEach(async () => {
	await stop();
});

test("visual comparison", async ({ page }) => {
	await page.goto("/admin/auth/signin");
	await page.waitForURL(/\/admin\/auth\/signin/);
	await expect(page).toHaveScreenshot();
});

test("shows 'field required' errors", async ({ page }) => {
	await page.goto("/admin/auth/signin");
	await page.click("button[type=submit]");
	await expect(page).toHaveScreenshot();
});

test("shows error when invalid credentials", async ({ page }) => {
	await page.goto("/admin/auth/signin");
	const emailInput = page.locator("input[type='email']");
	const passwordInput = page.locator("input[type='password']");
	const submitButton = page.locator("button[type='submit']");

	// Wrong email
	await emailInput.type("wrong@email.com");
	await passwordInput.type(PASSWORD);
	await submitButton.click();
	await page.waitForSelector("text=Niepoprawne dane!");
	await clearInputs();

	// Wrong password
	await emailInput.type(EMAIL);
	await passwordInput.type("wrongpassword");
	await submitButton.click();
	await page.waitForSelector("text=Niepoprawne dane!");
	await clearInputs();

	// Both wrong
	await emailInput.type("wrong@email.com");
	await passwordInput.type("wrongpassword");
	await submitButton.click();
	await page.waitForSelector("text=Niepoprawne dane!");

	await expect(page).toHaveScreenshot();

	async function clearInputs() {
		await emailInput.fill("");
		await passwordInput.fill("");
	}
});

test("shows error when server error", async ({ page }) => {
	await page.goto("/admin/auth/signin");
	await page.locator("input[type='email']").type(EMAIL);
	await page.locator("input[type='password']").type(PASSWORD);
	await stop();
	await page.locator("button[type='submit']").click();

	await expect(page.getByRole("alert")).toContainText("Nieznany błąd. Spróbuj ponownie później.");
	await expect(page).toHaveScreenshot();
});

test("shows error when email invalid", async ({ page }) => {
	await page.goto("/admin/auth/signin");
	await page.click("button[type=submit]");
	await page.locator("input[type='email']").type("invalid@domain");

	await expect(page.locator("text=Niepoprawny adres e-mail")).toBeVisible();
});

test("signs in when credentials are valid", async ({ page }) => {
	await page.goto("/admin/auth/signin");
	await page.locator("input[type='email']").type(EMAIL);
	await page.locator("input[type='password']").type(PASSWORD);
	await page.locator("button[type='submit']").click();
	await page.waitForURL(/\/admin\/dashboard/);

	expect(page.url()).toMatch(/\/admin\/dashboard/);
	await expect(page.locator("h1").first()).toContainText("Create T3 App");
});
