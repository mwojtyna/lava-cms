import { expect, test } from "@playwright/test";
import { start, stop, trpcMsw } from "@admin/e2e/mocks/trpc";
import { init } from "api/server";

const NAME = "John";
const LAST_NAME = "Doe";
const EMAIL = "johndoe@domain.com";
const PASSWORD = "Zaq1@wsx";

test.afterEach(async () => {
	await stop();
});

test("visual comparison", async ({ page }) => {
	const app = await init([
		trpcMsw.auth.firstTime.query((_, res, ctx) => {
			return res(ctx.data({ firstTime: true }));
		}),
	]);
	await start(app);

	await page.goto("/admin/auth/signin");
	await page.waitForURL(/\/admin\/auth\/signup/);
	await expect(page).toHaveScreenshot();
});

test("shows 'field required' errors", async ({ page }) => {
	const app = await init([
		trpcMsw.auth.firstTime.query((_, res, ctx) => {
			return res(ctx.data({ firstTime: true }));
		}),
	]);
	await start(app);

	await page.goto("/admin/auth/signin");
	await page.waitForURL(/\/admin\/auth\/signup/);
	await page.click("button[type=submit]");
	expect(await page.locator("text=Pole wymagane!").count()).toBe(5);
	await expect(page).toHaveScreenshot();
});

test("shows error when email invalid", async ({ page }) => {
	const app = await init([
		trpcMsw.auth.firstTime.query((_, res, ctx) => {
			return res(ctx.data({ firstTime: true }));
		}),
	]);
	await start(app);

	await page.goto("/admin/auth/signin");
	await page.locator("input[type='email']").fill("invalid@domain");

	await expect(page.locator("text=Niepoprawny adres e-mail!")).toBeVisible();
});

test("shows error when password invalid", async ({ page }) => {
	const app = await init([
		trpcMsw.auth.firstTime.query((_, res, ctx) => {
			return res(ctx.data({ firstTime: true }));
		}),
	]);
	await start(app);

	await page.goto("/admin/auth/signin");
	await page.locator("input[type='password']").first().fill("password");

	await expect(
		page.locator(
			"text=Hasło musi mieć minimum 8 znaków, jedną wielką literę, oraz jedną cyfrę!"
		)
	).toBeVisible();
});

test("shows error when passwords don't match", async ({ page }) => {
	const app = await init([
		trpcMsw.auth.firstTime.query((_, res, ctx) => {
			return res(ctx.data({ firstTime: true }));
		}),
	]);
	await start(app);

	await page.goto("/admin/auth/signin");
	await page.locator("input[type='password']").nth(1).fill("password");

	await expect(page.locator("text=Hasła nie są identyczne!")).toBeVisible();
});

test("signs up when info is valid", async ({ page }) => {
	let app = await init([
		trpcMsw.auth.firstTime.query((_, res, ctx) => {
			return res(ctx.data({ firstTime: true }));
		}),
	]);
	await start(app);

	await page.goto("/admin/auth/signup");
	await page.waitForURL(/\/admin\/auth\/signup/);
	await stop();

	app = await init([
		trpcMsw.auth.firstTime.query((_, res, ctx) => {
			return res(ctx.data({ firstTime: false }));
		}),
		trpcMsw.auth.signUp.mutation((_, res, ctx) => {
			// This request is sent client-side, so we need to setup cors headers manually
			return res(ctx.set("Access-Control-Allow-Origin", "http://localhost:3001"), ctx.data());
		}),
		trpcMsw.auth.signIn.mutation((_, res, ctx) => {
			return res(ctx.data({ userId: "123" }));
		}),
	]);
	await start(app);

	await page.locator("input[type='email']").fill(EMAIL);
	await page.locator("input[type='text']").first().fill(NAME);
	await page.locator("input[type='text']").nth(1).fill(LAST_NAME);
	await page.locator("input[type='password']").first().fill(PASSWORD);
	await page.locator("input[type='password']").nth(1).fill(PASSWORD);
	await page.locator("button[type=submit]").click();

	await page.waitForURL(/\/admin\/dashboard/);
});
