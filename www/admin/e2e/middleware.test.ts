import { expect, test } from "@playwright/test";
import { start, stop, trpcMsw } from "@admin/e2e/mocks/trpc";
import { init } from "api/server";
import { getSignedInPage } from "@admin/e2e/mocks/auth";

test.afterEach(async () => {
	await stop();
});

test("shows error overlay when trpc fails", async ({ page }) => {
	await page.goto("/admin/dashboard");
	const errorOverlay = await page.waitForSelector("div[data-nextjs-dialog-content='true']", {
		timeout: 5000,
	});

	expect(await errorOverlay.isVisible()).toBe(true);
});

test("redirects to sign up page when no user in database", async ({ page }) => {
	const app = await init([
		trpcMsw.auth.firstTime.query((_, res, ctx) => {
			return res(ctx.data({ firstTime: true }));
		}),
	]);
	await start(app);

	await page.goto("/admin");
	expect(page.url()).toMatch(/\/auth\/signup/);
});

test("redirects to sign in page when user is not signed in", async ({ page }) => {
	const app = await init([
		trpcMsw.auth.firstTime.query((_, res, ctx) => {
			return res(ctx.data({ firstTime: false }));
		}),
	]);
	await start(app);

	await page.goto("/admin");
	expect(page.url()).toMatch(/\/auth\/signin/);
});

test("redirects to dashboard when user is signed in", async ({ browser }) => {
	const app = await init();
	await start(app);

	const page = await getSignedInPage(browser);
	await page.goto("/admin");

	expect(page.url()).toMatch(/\/admin\/dashboard/);
	await expect(page.locator("h1").first()).toContainText("Create T3 App");
});
