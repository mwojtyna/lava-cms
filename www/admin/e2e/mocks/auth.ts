import { start, stop, trpcMsw } from "@admin/e2e/mocks/trpc";
import { init } from "api/server";
import { type Browser, chromium } from "playwright";

const STORAGE_STATE_PATH = "./e2e/storageState.json";

/**
 * Saves storage state to ./storageState.json
 */
export async function saveSignedInState() {
	const app = await init([
		trpcMsw.auth.signIn.mutation((_, res, ctx) => {
			return res(ctx.data({ userId: "123" }));
		}),
	]);
	await start(app);

	const browser = await chromium.launch();
	const page = await browser.newPage();

	await page.goto("/admin");
	await page.locator("input[name='email']").type("testuser@domain.com");
	await page.locator("input[name='password']").type("password");
	await page.locator("button[type='submit']").click();
	await page.waitForURL(/\/admin\/dashboard/);

	await page.context().storageState({ path: STORAGE_STATE_PATH });
	await browser.close();
	await stop();
}

export async function getSignedInPage(browser: Browser) {
	const context = await browser.newContext({
		storageState: STORAGE_STATE_PATH,
	});
	return await context.newPage();
}
