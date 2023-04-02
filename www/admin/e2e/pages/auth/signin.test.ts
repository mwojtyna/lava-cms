import { expect, test } from "@playwright/test";
import bcrypt from "bcrypt";
import { start, stop } from "@admin/e2e/mocks/trpc";
import { init } from "api/server";
import { prisma } from "api/prisma/client";
import { userMock } from "@admin/e2e/mocks/data";

test.beforeAll(async () => {
	await prisma.user.create({
		data: {
			...userMock,
			password: await bcrypt.hash(userMock.password, 10),
		},
	});
	await prisma.config.create({
		data: {
			title: "My website",
			description: "My website description",
			language: "en",
		},
	});
});
test.afterAll(async () => {
	await prisma.user.deleteMany();
	await prisma.config.deleteMany();
});

test.beforeEach(async () => {
	await start(await init());
});
test.afterEach(async () => {
	await stop();
});

test("light theme visual comparison", async ({ page }) => {
	await page.emulateMedia({ colorScheme: "light" });
	await page.goto("/admin/auth/signin", { waitUntil: "networkidle" });
	await expect(page).toHaveScreenshot();
});
test("dark theme visual comparison", async ({ page }) => {
	await page.emulateMedia({ colorScheme: "dark" });
	await page.goto("/admin/auth/signin", { waitUntil: "networkidle" });
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
	await passwordInput.type(userMock.password);
	await submitButton.click();
	await expect(page.locator("text=The credentials are invalid.")).toBeInViewport();
	await clearInputs();

	// Wrong password
	await emailInput.type(userMock.email);
	await passwordInput.type("wrongpassword");
	await submitButton.click();
	await expect(page.locator("text=The credentials are invalid.")).toBeInViewport();
	await clearInputs();

	// Both wrong
	await emailInput.type("wrong@email.com");
	await passwordInput.type("wrongpassword");
	await submitButton.click();
	await expect(page.locator("text=The credentials are invalid.")).toBeInViewport();

	await expect(page).toHaveScreenshot();

	async function clearInputs() {
		await emailInput.fill("");
		await passwordInput.fill("");
	}
});

test("shows error when server error", async ({ page }) => {
	await page.goto("/admin/auth/signin");
	await page.locator("input[type='email']").type(userMock.email);
	await page.locator("input[type='password']").type(userMock.password);
	await page.route("**/api/auth/callback/**", (route) =>
		route.fulfill({
			body: JSON.stringify({
				url: "http://localhost:3001/admin/api/auth/error?error=UnknownError&provider=credentials",
			}),
			status: 500,
		})
	);
	await page.locator("button[type='submit']").click();

	await expect(page.getByRole("alert")).toContainText("Something went wrong. Try again later.");
	await expect(page).toHaveScreenshot();
});

test("shows error when email invalid", async ({ page }) => {
	await page.goto("/admin/auth/signin");
	await page.click("button[type=submit]");
	await page.locator("input[type='email']").type("invalid@domain");

	await expect(page.locator("text=The e-mail you provided is invalid.")).toBeInViewport();
});

test("signs in when credentials are valid", async ({ page }) => {
	await page.goto("/admin/auth/signin");
	await page.locator("input[type='email']").type(userMock.email);
	await page.locator("input[type='password']").type(userMock.password);
	await page.locator("button[type='submit']").click();
	await page.waitForURL(/\/admin\/dashboard/);

	expect(page.url()).toMatch(/\/admin\/dashboard/);
	await expect(page.locator("#content").first()).toBeInViewport();
});
