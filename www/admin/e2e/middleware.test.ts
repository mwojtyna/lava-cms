import { expect, test } from "@playwright/test";
import { trpcMsw } from "@admin/e2e/mocks/trpcMsw";
import { type App, init, PORT } from "api/server";

async function start(app: App) {
	await new Promise<void>((resolve) =>
		app.listen(PORT, () => {
			console.log(`Mocking on port ${PORT}...`);
			resolve();
		})
	);
}

test("redirects to sign in page when not signed in", async ({ page }) => {
	const server = await init(
		trpcMsw.auth.firstTime.query((_, res, ctx) => {
			return res(ctx.data({ firstTime: true }));
		})
	);
	await start(server);

	await page.goto("http://localhost:3001/admin");
	expect(page.url()).toMatch(/\/auth\/signup/);
});
