import { expect } from "@playwright/test";
import { start, stop, trpcMsw } from "@admin/e2e/mocks/trpc";
import { init } from "api/server";
import { test } from "./fixtures";

test.afterEach(async () => {
	await stop();
});

test("redirects to sign up page when no user is signed up", async ({ page }) => {
	const app = await init([
		trpcMsw.auth.setupRequired.query((_, res, ctx) => {
			return res(ctx.data({ reason: "no-user" }));
		}),
	]);
	await start(app);

	await page.goto("/admin");
	expect(page.url()).toMatch(/\/setup$/);
	await expect(page.getByTestId("sign-up")).toBeInViewport();
});

test("redirects to sign in page when user is not signed in", async ({ page }) => {
	const app = await init([
		trpcMsw.auth.setupRequired.query((_, res, ctx) => {
			return res(ctx.data({ reason: null }));
		}),
	]);
	await start(app);

	await page.goto("/admin");
	expect(page.url()).toMatch(/\/signin$/);
	await expect(page.getByTestId("sign-in")).toBeInViewport();
});

test("redirects to dashboard when user is signed in", async ({ authedPage }) => {
	const app = await init([
		trpcMsw.auth.setupRequired.query((_, res, ctx) => {
			return res(ctx.data({ reason: null }));
		}),
	]);
	await start(app);

	await authedPage.goto("/admin");

	expect(authedPage.url()).toMatch(/\/admin\/dashboard$/);
	await expect(authedPage.locator("#content").first()).toBeInViewport();
});

test("returns 401 when trying to access /trpc when not signed in", async ({ page }) => {
	const app = await init([
		trpcMsw.auth.setupRequired.query((_, res, ctx) => {
			return res(ctx.data({ reason: null }));
		}),
	]);
	await start(app);

	const res = await page.goto("/admin/trpc");
	expect(page.url()).toMatch(/\/admin\/trpc$/);
	expect(res?.status()).toBe(401);
});

test("returns json when trying to access /trpc when signed in", async ({ authedPage }) => {
	const app = await init([
		trpcMsw.auth.setupRequired.query((_, res, ctx) => {
			return res(ctx.data({ reason: null }));
		}),
	]);
	await start(app);

	const res = await authedPage.goto("/admin/trpc/random.endpoint");
	expect(authedPage.url()).toMatch(/\/admin\/trpc/);
	expect(await res?.headerValue("content-type")).toMatch(/application\/json/);
	expect(await res?.json()).toBeDefined();
});

test("returns json when trying to access /trpc when no user signed up", async ({ authedPage }) => {
	const app = await init([
		trpcMsw.auth.setupRequired.query((_, res, ctx) => {
			return res(ctx.data({ reason: "no-user" }));
		}),
	]);
	await start(app);

	const res = await authedPage.goto("/admin/trpc/random.endpoint");
	expect(authedPage.url()).toMatch(/\/admin\/trpc/);
	expect(await res?.headerValue("content-type")).toMatch(/application\/json/);
	expect(await res?.json()).toBeDefined();
});
