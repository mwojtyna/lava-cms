import type { Browser } from "playwright";
import type { BrowserContextOptions, Page } from "@playwright/test";
import fs from "node:fs";
import bcrypt from "bcrypt";
import { prisma } from "api/prisma/client";
import { init } from "api/server";
import { start, stop } from "@admin/e2e/mocks/trpc";

export const STORAGE_STATE_PATH = "./e2e/storageState.json";
export const NAME = "John";
export const LAST_NAME = "Doe";
export const EMAIL = "johndoe@domain.com";
export const PASSWORD = "password";

export const authedPage = async (
	{ browser }: { browser: Browser },
	use: (r: Page) => Promise<void>
) => {
	// We have to check if the user exists because a test might create one
	const existingUser = await prisma.user.findFirst();
	const { id } =
		existingUser ??
		(await prisma.user.create({
			data: {
				name: NAME,
				last_name: LAST_NAME,
				email: EMAIL,
				password: await bcrypt.hash(PASSWORD, 10),
			},
		}));

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

	// Run test
	await use(authedPage);

	// We have to check if the user exists because a test
	// might delete an already created user
	if (await prisma.user.findFirst()) {
		await prisma.user.delete({ where: { id: id } });
	}
};

async function saveSignedInState(browser: Browser) {
	const app = await init();
	await start(app);

	const page = await browser.newPage();

	await page.goto("/admin");
	await page.locator("input[name='email']").type(EMAIL);
	await page.locator("input[name='password']").type(PASSWORD);
	await page.locator("button[type='submit']").click();
	await page.waitForURL(/\/admin\/dashboard/);

	await page.context().storageState({ path: STORAGE_STATE_PATH });
	await page.close();
	await stop();
}
