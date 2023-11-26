import type { BrowserContextOptions, Browser, BrowserContext } from "@playwright/test";
import fs from "node:fs";
import { prisma } from "@admin/prisma/client";
import {
	createMockUser,
	deleteMockUser,
	tokenMock,
	userMock,
	userPasswordDecrypted,
	websiteSettingsMock,
} from "@admin/e2e/mocks";
import { DEFAULT_SESSION_COOKIE_NAME } from "lucia";

const STORAGE_STATE_PATH = "./e2e/storageState.json";

export async function saveAuthedContext(browser: Browser) {
	console.log("Saving signed in state...");
	const page = await browser.newPage();

	await page.goto("/admin/signin");
	await page.locator("input[name='email']").type(userMock.email);
	await page.locator("input[name='password']").type(userPasswordDecrypted);
	await page.locator("button[type='submit']").click();

	await page.waitForURL(/\/admin\/dashboard/);

	const cookies = await page.context().cookies();
	const whitelist = [DEFAULT_SESSION_COOKIE_NAME];

	const cookiesToDelete = cookies
		.filter((cookie) => !whitelist.includes(cookie.name))
		.map((cookie) => cookies.indexOf(cookie));

	cookiesToDelete.forEach((index) => cookies.splice(index, 1));

	await page.context().clearCookies();
	await page.context().addCookies(cookies);

	await page.context().storageState({ path: STORAGE_STATE_PATH });
	await page.close();

	// Delete session that was created when signed in
	// to prevent prisma error when creating session
	// during fixture execution
	await prisma.adminSession.deleteMany();
}

export async function getAuthedContext(browser: Browser): Promise<BrowserContext> {
	console.log("Getting signed in state...");
	// We have to check if the user exists because a test might create one
	await deleteMockUser();
	await createMockUser();

	if (!(await prisma.settingsSeo.findFirst())) {
		await prisma.settingsSeo.create({
			data: {
				...websiteSettingsMock,
			},
		});
	}
	await prisma.settingsConnection.create({
		data: {
			token: tokenMock,
		},
	});

	await prisma.page.deleteMany();
	await prisma.page.create({
		data: {
			name: "Root",
			url: "",
			is_group: true,
			parent_id: null,
		},
	});

	await prisma.componentDefinitionGroup.deleteMany();
	await prisma.componentDefinitionGroup.create({
		data: {
			name: "Root",
			parent_group_id: null,
		},
	});

	if (!fs.existsSync(STORAGE_STATE_PATH)) {
		await saveAuthedContext(browser);
		console.log("Saved signed in state.");
	}

	// Check if cookies are not expired
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const storageState: BrowserContextOptions["storageState"] = JSON.parse(
		fs.readFileSync(STORAGE_STATE_PATH, "utf-8"),
	);

	if (typeof storageState !== "string" && typeof storageState !== "undefined") {
		const cookies = storageState.cookies;
		const expiredCookies = cookies.filter(
			(cookie) => cookie.expires !== -1 && cookie.expires * 1000 < Date.now(),
		);

		await prisma.adminSession.create({
			data: {
				id: cookies.find((cookie) => cookie.name === DEFAULT_SESSION_COOKIE_NAME)!.value,
				user_id: userMock.id,
				active_expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).getTime(),
				idle_expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).getTime(),
			},
		});

		if (expiredCookies.length > 0) {
			await saveAuthedContext(browser);
			console.log("Cookies expired; saved signed in state.");
		}
	} else {
		throw new Error("Could not parse storage state");
	}

	return await browser.newContext({
		storageState: STORAGE_STATE_PATH,
	});
}

export async function cleanUpAuthedContext(context: BrowserContext) {
	await deleteMockUser();
	if (await prisma.settingsSeo.findFirst()) {
		await prisma.settingsSeo.deleteMany();
	}
	await prisma.page.deleteMany();
	await prisma.componentDefinitionGroup.deleteMany();
	await prisma.settingsConnection.deleteMany();

	await context.close();
}
