import { expect } from "@playwright/test";
import { test } from "./fixtures";
import { prisma } from "@admin/prisma/client";
import { createMockUser, deleteMockUser, websiteSettingsMock } from "./mocks/data";

async function createConfig() {
	await prisma.config.create({
		data: {
			...websiteSettingsMock,
		},
	});
}

test.afterEach(async () => {
	await prisma.config.deleteMany();
	await prisma.page.deleteMany();
	await deleteMockUser();
});

test.describe("/setup", () => {
	test("redirects to /setup when no user is signed up", async ({ page }) => {
		await createConfig();

		await page.goto("/admin/dashboard");
		expect(page.url()).toMatch(/\/setup$/);
		await expect(page.getByTestId("sign-up")).toBeInViewport();

		await page.goto("/admin/signin");
		expect(page.url()).toMatch(/\/setup$/);
		await expect(page.getByTestId("sign-up")).toBeInViewport();
	});
	test("redirects to /dashboard if signed in and accessing /setup", async ({ authedPage }) => {
		await authedPage.goto("/admin/setup");
		expect(authedPage.url()).toMatch(/\/admin\/dashboard$/);
		await expect(authedPage.locator("#content").first()).toBeInViewport();
	});
	test("redirects to /signin if not signed in and accessing /setup", async ({ page }) => {
		await createMockUser();
		await createConfig();

		await page.goto("/admin/setup");
		expect(page.url()).toMatch(/\/signin$/);
		await expect(page.getByTestId("sign-in")).toBeInViewport();
	});
});

test.describe("/signin", () => {
	test("redirects to /signin when user is not signed in", async ({ page }) => {
		await createMockUser();
		await createConfig();

		await page.goto("/admin/dashboard");
		expect(page.url()).toMatch(/\/signin$/);
		await expect(page.getByTestId("sign-in")).toBeInViewport();

		await page.goto("/admin/setup");
		expect(page.url()).toMatch(/\/signin$/);
		await expect(page.getByTestId("sign-in")).toBeInViewport();
	});
	test("redirects to /dashboard if signed in and accessing /signin", async ({ authedPage }) => {
		await authedPage.goto("/admin/signin");
		expect(authedPage.url()).toMatch(/\/admin\/dashboard$/);
		await expect(authedPage.locator("#content").first()).toBeInViewport();
	});
});

test("redirects to dashboard when user is signed in", async ({ authedPage }) => {
	await authedPage.goto("/admin");
	expect(authedPage.url()).toMatch(/\/admin\/dashboard$/);
	await expect(authedPage.locator("#content").first()).toBeInViewport();
});
