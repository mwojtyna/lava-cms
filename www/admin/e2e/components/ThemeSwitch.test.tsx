import { test, expect, type Page } from "@playwright/test";

const TEST_ID = "theme-switch";
function getColorScheme(page: Page) {
	return page.locator("html").evaluate((node) => window.getComputedStyle(node).colorScheme);
}

test("light theme visual comparison", async ({ page }) => {
	await page.goto("/admin");
	expect(await page.getByTestId(TEST_ID).screenshot()).toMatchSnapshot();
});
test("dark theme visual comparison", async ({ page }) => {
	await page.goto("/admin");
	const element = page.getByTestId(TEST_ID);
	await element.click();
	await page.waitForTimeout(500); // Wait for the switch to animate

	expect(await element.screenshot()).toMatchSnapshot();
});

test("automatically switches to light theme if it is the preferred theme and cookie not is present", async ({
	page,
}) => {
	await page.emulateMedia({ colorScheme: "light" });
	await page.goto("/admin");

	const colorScheme = await getColorScheme(page);
	expect(colorScheme).toBe("light");
});
test("automatically switches to dark theme if it is the preferred theme and cookie not is present", async ({
	page,
}) => {
	await page.emulateMedia({ colorScheme: "dark" });
	await page.goto("/admin");

	const colorScheme = await getColorScheme(page);
	expect(colorScheme).toBe("dark");
});

test("reads color scheme from cookie if present", async ({ page, context }) => {
	await page.emulateMedia({ colorScheme: "light" });
	await page.goto("/admin");

	const initialColorScheme = await getColorScheme(page);
	expect(initialColorScheme).toBe("light");

	await page.getByTestId(TEST_ID).click();
	await page.reload();

	const cookiesColorScheme = await getColorScheme(page);
	expect(cookiesColorScheme).toBe("dark");
	expect((await context.cookies()).find((cookie) => cookie.name === "color-scheme")?.value).toBe(
		"dark"
	);
});
