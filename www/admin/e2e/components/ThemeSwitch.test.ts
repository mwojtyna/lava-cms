import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import { init } from "api/server";
import { start, stop } from "../mocks/trpc";
import { type ColorTheme, colorThemeSchema } from "@admin/src/data/stores/dashboard";
import type { CookieName } from "@admin/src/utils/cookies";

const TEST_ID = "theme-switch";

const getColorScheme = (page: Page): Promise<ColorTheme> =>
	page.locator("body").evaluate((node) => (node.classList.contains("dark") ? "dark" : "light"));

const getCookie = (context: BrowserContext): Promise<ColorTheme | undefined> =>
	context
		.cookies()
		.then(
			async (cookies) =>
				await colorThemeSchema
					.optional()
					.parseAsync(
						cookies.find(
							(cookie) => cookie.name === ("color-theme" satisfies CookieName)
						)?.value
					)
		);

test.beforeAll(async () => {
	await start(await init());
});
test.afterAll(async () => {
	await stop();
});

test("light theme visual comparison", async ({ page }) => {
	await page.goto("/admin/setup");
	expect(await page.getByTestId(TEST_ID).screenshot()).toMatchSnapshot();
});
test("dark theme visual comparison", async ({ page }) => {
	await page.goto("/admin/setup");
	const element = page.getByTestId(TEST_ID);

	await element.click();
	await page.waitForTimeout(100); // Wait for the switch to animate

	expect(await element.screenshot()).toMatchSnapshot();
});

test("when pressing the switch, cookie and theme are updated", async ({ page, context }) => {
	expect(await getCookie(context)).toBeUndefined();

	await page.emulateMedia({ colorScheme: "light" });
	await page.goto("/admin/setup", { waitUntil: "networkidle" });

	const themeSwitch = page.getByTestId(TEST_ID);

	expect(await getColorScheme(page)).toBe("light");
	expect(await getCookie(context)).toBe("light");

	await themeSwitch.click();
	await page.waitForTimeout(100); // Wait for the switch to animate

	expect(await getColorScheme(page)).toBe("dark");
	expect(await getCookie(context)).toBe("dark");

	await themeSwitch.click();
	await page.waitForTimeout(100); // Wait for the switch to animate

	expect(await getColorScheme(page)).toBe("light");
	expect(await getCookie(context)).toBe("light");
});

test("automatically switches to light theme and sets cookie if it is the preferred theme and cookie is not present", async ({
	page,
	context,
}) => {
	expect(await getCookie(context)).toBe(undefined);

	await page.emulateMedia({ colorScheme: "light" });
	await page.goto("/admin/setup", { waitUntil: "networkidle" });

	const colorScheme = await getColorScheme(page);
	expect(colorScheme).toBe("light");
	expect(await getCookie(context)).toBe("light");
});
test("automatically switches to dark theme and sets cookie if it is the preferred theme and cookie is not present", async ({
	page,
	context,
}) => {
	expect(await getCookie(context)).toBe(undefined);

	await page.emulateMedia({ colorScheme: "dark" });
	await page.goto("/admin/setup", { waitUntil: "networkidle" });

	const colorScheme = await getColorScheme(page);
	expect(colorScheme).toBe("dark");
	expect(await getCookie(context)).toBe("dark");
});

test("when changing the preferred system theme, the website theme is updated", async ({
	page,
	context,
}) => {
	await page.emulateMedia({ colorScheme: "light" });
	await page.goto("/admin/setup", { waitUntil: "networkidle" });

	expect(await getColorScheme(page)).toBe("light");
	expect(await getCookie(context)).toBe("light");

	await page.emulateMedia({ colorScheme: "dark" });

	expect(await getColorScheme(page)).toBe("dark");
	expect(await getCookie(context)).toBe("dark");
});
test("when cookie disagrees with preferred theme, cookie takes precedence", async ({
	page,
	context,
}) => {
	await context.addCookies([
		{
			name: "color-theme" satisfies CookieName,
			value: "dark",
			sameSite: "Lax",
			domain: "localhost",
			path: "/",
		},
	]);
	await page.emulateMedia({ colorScheme: "light" });
	await page.goto("/admin/setup", { waitUntil: "networkidle" });

	expect(await getColorScheme(page)).toBe("dark");
	expect(await getCookie(context)).toBe("dark");
});
