import { expect, test } from "@playwright/test";
import { trpcMsw } from "@admin/e2e/mocks/trpcMsw";
import { createHttpTerminator } from "http-terminator";
import { type App, init, PORT } from "api/server";

let server: ReturnType<typeof createHttpTerminator> | null = null;

async function start(app: App) {
	if (server) {
		throw new Error("Server already started!");
	}

	return new Promise<void>((resolve) => {
		server = createHttpTerminator({
			server: app.listen(PORT, () => {
				console.log(`Mocking on port ${PORT}...`);
				resolve();
			}),
		});
	});
}

test.afterEach(async () => {
	await server?.terminate();
	console.log("Mocking stopped");
	server = null;
});

test("shows error overlay when trpc fails", async ({ page }) => {
	await page.goto("http://localhost:3001/admin/dashboard");
	const errorOverlay = await page.waitForSelector("div[data-nextjs-dialog-content='true']", {
		timeout: 5000,
	});

	expect(await errorOverlay.isVisible()).toBe(true);
});

test("redirects to sign up page when no user in database", async ({ page }) => {
	const app = await init(
		trpcMsw.auth.firstTime.query((_, res, ctx) => {
			return res(ctx.data({ firstTime: true }));
		})
	);
	await start(app);

	await page.goto("/admin");
	expect(page.url()).toMatch(/\/auth\/signup/);
});

test("redirects to sign in page when user is not signed in", async ({ page }) => {
	const app = await init(
		trpcMsw.auth.firstTime.query((_, res, ctx) => {
			return res(ctx.data({ firstTime: false }));
		})
	);
	await start(app);

	await page.goto("/admin");
	expect(page.url()).toMatch(/\/auth\/signin/);
});
