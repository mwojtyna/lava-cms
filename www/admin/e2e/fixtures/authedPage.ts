import type { Browser, Page } from "@playwright/test";
import { cleanUpAuthedContext, getAuthedContext } from "./utils";

export class AuthedPage {
	constructor(
		public base: Page,
		private readonly browser: Browser,
	) {}

	async prepare() {
		const authedContext = await getAuthedContext(this.browser);
		this.base = await authedContext.newPage();
	}
	async close() {
		await cleanUpAuthedContext(this.base.context());
	}

	// This shitfest is required because of webkit hydration errors
	async goto(url: string, options?: Parameters<Page["goto"]>[1]) {
		await this.base.goto(
			url,
			this.browser.browserType().name() === "webkit"
				? { waitUntil: "networkidle", ...options }
				: options,
		);
	}
}

export const authedPage = async (
	{ browser, page }: { browser: Browser; page: Page },
	use: (r: AuthedPage) => Promise<void>,
) => {
	const authedPage = new AuthedPage(page, browser);
	await authedPage.prepare();

	await use(authedPage);

	await authedPage.close();
};
