import { expect } from "@playwright/test";
import { test } from "./fixtures";
import { prisma } from "@admin/../api/prisma/client";
import { userMock, websiteSettingsMock } from "./mocks/data";

async function createUser() {
	await prisma.user.create({
		data: {
			...userMock,
		},
	});
}
async function createConfig() {
	await prisma.config.create({
		data: {
			...websiteSettingsMock,
		},
	});
}

test("redirects to sign up page when no user is signed up", async ({ page }) => {
	await createConfig();

	await page.goto("/admin");
	expect(page.url()).toMatch(/\/setup$/);
	await expect(page.getByTestId("sign-up")).toBeInViewport();
});

test("redirects to sign in page when user is not signed in", async ({ page }) => {
	await createUser();
	await createConfig();

	await page.goto("/admin");
	expect(page.url()).toMatch(/\/signin$/);
	await expect(page.getByTestId("sign-in")).toBeInViewport();
});

test("redirects to dashboard when user is signed in", async ({ authedPage }) => {
	await authedPage.goto("/admin");
	expect(authedPage.url()).toMatch(/\/admin\/dashboard$/);
	await expect(authedPage.locator("#content").first()).toBeInViewport();
});

test("returns 401 when trying to access /trpc when not signed in", async ({ page }) => {
	await createUser();
	await createConfig();

	const res = await page.goto("/admin/trpc");
	expect(page.url()).toMatch(/\/admin\/trpc$/);
	expect(res?.status()).toBe(401);
});

test("returns json when trying to access /trpc when signed in", async ({ authedPage }) => {
	const res = await authedPage.goto("/admin/trpc/random.endpoint");
	expect(authedPage.url()).toMatch(/\/admin\/trpc/);
	expect(await res?.headerValue("content-type")).toMatch(/application\/json/);
	expect(await res?.json()).toBeDefined();
});

test("returns json when trying to access /trpc when no user signed up", async ({ authedPage }) => {
	const res = await authedPage.goto("/admin/trpc/random.endpoint");
	expect(authedPage.url()).toMatch(/\/admin\/trpc/);
	expect(await res?.headerValue("content-type")).toMatch(/application\/json/);
	expect(await res?.json()).toBeDefined();
});
