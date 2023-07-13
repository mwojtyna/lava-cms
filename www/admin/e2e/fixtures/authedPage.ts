import type { Browser, Page } from "@playwright/test";
import { cleanUpAuthedContext, getAuthedContext } from "./utils";

export const authedPage = async (
	{ browser }: { browser: Browser },
	use: (r: Page) => Promise<void>,
) => {
	const authedContext = await getAuthedContext(browser);
	const authedPage = await authedContext.newPage();

	// Run test
	await use(authedPage);

	await cleanUpAuthedContext();
};
