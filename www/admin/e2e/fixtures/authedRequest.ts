import type { APIRequestContext, Browser } from "@playwright/test";
import { cleanUpAuthedContext, getAuthedContext } from "./utils";

export const authedRequest = async (
	{ browser }: { browser: Browser },
	use: (r: APIRequestContext) => Promise<void>,
) => {
	const authedContext = await getAuthedContext(browser);
	const authedRequest = authedContext.request;

	// Run test
	await use(authedRequest);

	await cleanUpAuthedContext(authedContext);
};
