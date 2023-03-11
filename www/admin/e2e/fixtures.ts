import type { Page } from "playwright";
import { BrowserContextOptions, test as base } from "@playwright/test";
import fs from "node:fs";
import { saveSignedInState, STORAGE_STATE_PATH } from "./mocks/saveSignedInState";

interface Fixtures {
	authedPage: Page;
}

export const test = base.extend<Fixtures>({
	authedPage: async ({ browser }, use) => {
		if (!fs.existsSync(STORAGE_STATE_PATH)) {
			await saveSignedInState(browser);
			console.log("Saved signed in state");
		}

		// Check if cookies are not expired
		const storageState: BrowserContextOptions["storageState"] = JSON.parse(
			fs.readFileSync(STORAGE_STATE_PATH, "utf-8")
		);

		if (typeof storageState !== "string" && typeof storageState !== "undefined") {
			const cookies = storageState.cookies;
			const expiredCookies = cookies.filter((cookie) => {
				return cookie.expires !== -1 && cookie.expires * 1000 < Date.now();
			});

			if (expiredCookies.length > 0) {
				await saveSignedInState(browser);
				console.log("Cookies expired; saved signed in state ");
			}
		} else {
			throw new Error("Could not parse storage state");
		}

		const context = await browser.newContext({
			storageState: STORAGE_STATE_PATH,
		});
		const authedPage = await context.newPage();

		await use(authedPage);
	},
});
