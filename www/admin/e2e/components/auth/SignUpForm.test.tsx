import { expect, test } from "@playwright/test";
import { start, stop, trpcMsw } from "@admin/e2e/mocks/trpc";
import { init } from "api/server";

test.afterEach(async () => {
	await stop();
});

test("visual comparison", async ({ page }) => {
	const app = await init([
		trpcMsw.auth.firstTime.query((_, res, ctx) => {
			return res(ctx.data({ firstTime: true }));
		}),
	]);
	await start(app);

	await page.goto("/admin/auth/signin");
	await page.waitForURL(/\/admin\/auth\/signup/);
	await expect(page).toHaveScreenshot();
});

test("shows 'field required' errors", async ({ page }) => {
	const app = await init([
		trpcMsw.auth.firstTime.query((_, res, ctx) => {
			return res(ctx.data({ firstTime: true }));
		}),
	]);
	await start(app);

	await page.goto("/admin/auth/signin");
	await page.waitForURL(/\/admin\/auth\/signup/);
	await page.click("button[type=submit]");
	expect(await page.locator("text=Pole wymagane!").count()).toBe(5);
	await expect(page).toHaveScreenshot();
});
