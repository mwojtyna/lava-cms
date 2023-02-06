import { start, stop, trpcMsw } from "@admin/e2e/mocks/trpc";
import { init } from "api/server";
import { type Browser, chromium } from "playwright";

/**
 * Saves storage state to ./storageState.json
 */
export async function saveSignedInState() {
	const app = await init(
		trpcMsw.auth.signIn.mutation((_, res, ctx) => {
			return res(ctx.data("id"));
		})
	);
	await start(app);

	const browser = await chromium.launch();
	const page = await browser.newPage();

	await page.goto("/admin");
	await page.locator("input[name='email']").fill("testuser@domain.com");
	await page.locator("input[name='password']").fill("password");
	await page.locator("button[type='submit']").click();
	await page.waitForURL(/\/admin\/dashboard/);

	await page.context().storageState({ path: "./storageState.json" });
	await browser.close();
	await stop();
}

export async function getSignedInPage(browser: Browser) {
	const context = await browser.newContext({
		storageState: "./storageState.json",
	});
	return await context.newPage();
}
