import { expect } from "@playwright/test";
import { prisma } from "@admin/prisma/client";
import { test } from "./fixtures";
import { createMockUser, deleteMockUser, seoSettingsMock } from "./mocks";

async function createSettings() {
	await prisma.settingsSeo.create({
		data: seoSettingsMock,
	});
}

test.afterEach(async () => {
	await prisma.settingsSeo.deleteMany();
	await prisma.page.deleteMany();
	await deleteMockUser();
});

test.describe("/setup", () => {
	test("redirects to /setup when no user is signed up", async ({ page }) => {
		await createSettings();

		await page.goto("/admin/dashboard");
		expect(page.url()).toMatch(/\/setup$/);
		await expect(page.getByTestId("sign-up")).toBeInViewport();

		await page.goto("/admin/signin");
		expect(page.url()).toMatch(/\/setup$/);
		await expect(page.getByTestId("sign-up")).toBeInViewport();
	});
	test("redirects to /dashboard if signed in and accessing /setup", async ({
		authedPage: page,
	}) => {
		await page.goto("/admin/setup");
		expect(page.base.url()).toMatch(/\/admin\/dashboard$/);
		await expect(page.base.locator("#content").first()).toBeInViewport();
	});
	test("redirects to /signin if not signed in and accessing /setup", async ({ page }) => {
		await createMockUser();
		await createSettings();

		await page.goto("/admin/setup");
		expect(page.url()).toMatch(/\/signin$/);
		await expect(page.getByTestId("sign-in")).toBeInViewport();
	});
});

test.describe("/signin", () => {
	test("redirects to /signin when user is not signed in", async ({ page }) => {
		await createMockUser();
		await createSettings();

		await page.goto("/admin/dashboard");
		expect(page.url()).toMatch(/\/signin$/);
		await expect(page.getByTestId("sign-in")).toBeInViewport();

		await page.goto("/admin/setup");
		expect(page.url()).toMatch(/\/signin$/);
		await expect(page.getByTestId("sign-in")).toBeInViewport();
	});
	test("redirects to /dashboard if signed in and accessing /signin", async ({
		authedPage: page,
	}) => {
		await page.goto("/admin/signin");
		expect(page.base.url()).toMatch(/\/admin\/dashboard$/);
		await expect(page.base.locator("#content").first()).toBeInViewport();
	});
});

test("redirects to dashboard when user is signed in", async ({ authedPage: page }) => {
	await page.goto("/admin");
	expect(page.base.url()).toMatch(/\/admin\/dashboard$/);
	await expect(page.base.locator("#content").first()).toBeInViewport();
});
