import { expect, test } from "@playwright/test";
import { start, stop, trpcMsw } from "@admin/e2e/mocks/trpc";
import { init } from "api/server";

const EMAIL = "johndoe@domain.com";
const PASSWORD = "password";

test.afterEach(async () => {
	await stop();
});

test("visual comparison", async ({ page }) => {
	const app = await init([
		trpcMsw.auth.firstTime.query((_, res, ctx) => {
			return res(ctx.data({ firstTime: false }));
		}),
	]);
	await start(app);

	await page.goto("/admin/auth/signin");
	await page.waitForURL(/\/admin\/auth\/signin/);
	await expect(page).toHaveScreenshot();
});

test("shows 'field required' errors", async ({ page }) => {
	const app = await init([
		trpcMsw.auth.firstTime.query((_, res, ctx) => {
			return res(ctx.data({ firstTime: false }));
		}),
	]);
	await start(app);

	await page.goto("/admin/auth/signin");
	await page.click("button[type=submit]");
	expect(await page.locator("text=Pole wymagane!").count()).toBe(2);
	await expect(page).toHaveScreenshot();
});

test("shows error when invalid credentials", async ({ page }) => {
	const app = await init([
		trpcMsw.auth.firstTime.query((_, res, ctx) => {
			return res(ctx.data({ firstTime: false }));
		}),
	]);
	await start(app);

	await page.goto("/admin/auth/signin");
	await page.locator("input[type='email']").fill(EMAIL);
	await page.locator("input[type='password']").fill(PASSWORD);
	await page.locator("button[type='submit']").click();
	await page.waitForResponse(/\/api\/auth\/callback\/credentials/);

	await expect(page.getByRole("alert")).toContainText("Niepoprawne dane!");
	await expect(page).toHaveScreenshot();
});

test("shows error when server error", async ({ page }) => {
	const app = await init([
		trpcMsw.auth.firstTime.query((_, res, ctx) => {
			return res(ctx.data({ firstTime: false }));
		}),
	]);
	await start(app);

	await page.goto("/admin/auth/signin");
	await page.locator("input[type='email']").fill(EMAIL);
	await page.locator("input[type='password']").fill(PASSWORD);
	await stop();
	await page.locator("button[type='submit']").click();

	await expect(page.getByRole("alert")).toContainText("Nieznany błąd. Spróbuj ponownie później.");
	await expect(page).toHaveScreenshot();
});

test("shows error when email invalid", async ({ page }) => {
	const app = await init([
		trpcMsw.auth.firstTime.query((_, res, ctx) => {
			return res(ctx.data({ firstTime: false }));
		}),
	]);
	await start(app);

	await page.goto("/admin/auth/signin");
	await page.locator("input[type='email']").fill("invalid@domain");

	await expect(page.locator("text=Niepoprawny adres e-mail!")).toBeVisible();
});

test("signs in when credentials are valid", async ({ page }) => {
	const app = await init([
		trpcMsw.auth.firstTime.query((_, res, ctx) => {
			return res(ctx.data({ firstTime: false }));
		}),
		trpcMsw.auth.signIn.mutation((_, res, ctx) => {
			return res(ctx.data({ userId: "123" }));
		}),
	]);
	await start(app);

	await page.goto("/admin/auth/signin");
	await page.locator("input[type='email']").fill(EMAIL);
	await page.locator("input[type='password']").fill(PASSWORD);
	await page.locator("button[type='submit']").click();
	await page.waitForURL(/\/admin\/dashboard/);
});
