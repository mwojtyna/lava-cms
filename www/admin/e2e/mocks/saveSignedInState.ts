import { start, stop, trpcMsw } from "@admin/e2e/mocks/trpc";
import { init } from "api/server";
import type { Browser } from "playwright";

export const STORAGE_STATE_PATH = "./e2e/storageState.json";

/**
 * Saves storage state to storageState.json
 */
export async function saveSignedInState(browser: Browser) {
	const app = await init([
		trpcMsw.auth.firstTime.query((_, res, ctx) => {
			return res(ctx.data({ firstTime: false }));
		}),
		trpcMsw.auth.signIn.mutation((_, res, ctx) => {
			return res(ctx.data({ userId: "123" }));
		}),
	]);
	await start(app);

	const page = await browser.newPage();

	await page.goto("/admin");
	await page.locator("input[name='email']").type("testuser@domain.com");
	await page.locator("input[name='password']").type("password");
	await page.locator("button[type='submit']").click();
	await page.waitForURL(/\/admin\/dashboard/);

	await page.context().storageState({ path: STORAGE_STATE_PATH });
	await page.close();
	await stop();
}
