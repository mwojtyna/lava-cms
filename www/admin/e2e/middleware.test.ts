import { expect } from "@playwright/test";
import { start, stop, trpcMsw } from "@admin/e2e/mocks/trpc";
import { init } from "api/server";
import { test } from "./fixtures";

test.afterEach(async () => {
	await stop();
});

test("redirects to sign up page when no setup is required", async ({ page }) => {
	const app = await init([
		trpcMsw.auth.setupRequired.query((_, res, ctx) => {
			return res(ctx.data({ setupRequired: true }));
		}),
	]);
	await start(app);

	await page.goto("/admin");
	expect(page.url()).toMatch(/\/auth\/signup/);
});

test("redirects to sign in page when user is not signed in", async ({ page }) => {
	const app = await init([
		trpcMsw.auth.setupRequired.query((_, res, ctx) => {
			return res(ctx.data({ setupRequired: false }));
		}),
	]);
	await start(app);

	await page.goto("/admin");
	expect(page.url()).toMatch(/\/auth\/signin/);
});

test("redirects to dashboard when user is signed in", async ({ authedPage }) => {
	const app = await init([
		trpcMsw.auth.setupRequired.query((_, res, ctx) => {
			return res(ctx.data({ setupRequired: false }));
		}),
	]);
	await start(app);

	await authedPage.goto("/admin");

	expect(authedPage.url()).toMatch(/\/admin\/dashboard/);
	await expect(authedPage.locator("#content").first()).toBeVisible();
});

test("returns 401 when trying to access /api/trpc when not signed in", async ({ page }) => {
	const app = await init([
		trpcMsw.auth.setupRequired.query((_, res, ctx) => {
			return res(ctx.data({ setupRequired: false }));
		}),
	]);
	await start(app);

	const res = await page.goto("/admin/api/trpc");
	expect(page.url()).toMatch(/\/admin\/api\/trpc/);
	expect(res?.status()).toBe(401);
	expect(await res?.headerValue("content-type")).toMatch(/text\/plain/);
	expect(await res?.text()).toBe("Unauthorized");
});

test("returns json when trying to access /api/trpc when signed in", async ({ authedPage }) => {
	const app = await init([
		trpcMsw.auth.setupRequired.query((_, res, ctx) => {
			return res(ctx.data({ setupRequired: false }));
		}),
	]);
	await start(app);

	const res = await authedPage.goto("/admin/api/trpc");
	expect(authedPage.url()).toMatch(/\/admin\/api\/trpc/);
	expect(await res?.headerValue("content-type")).toMatch(/application\/json/);
	expect(await res?.json()).toBeTruthy();
});
