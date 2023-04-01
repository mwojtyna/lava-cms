import { expect } from "@playwright/test";
import { test } from "@admin/e2e/fixtures";
import { init } from "api/server";
import { start, stop } from "@admin/e2e/mocks/trpc";
import { EMAIL, LAST_NAME, NAME } from "@admin/e2e/fixtures/authedPage";

const MENU_ID = "user-menu";
const MENU_DROPDOWN_ID = "user-menu-dropdown";

test.beforeAll(async () => {
	await start(await init());
});
test.afterAll(async () => {
	await stop();
});

test("light theme visual comparison", async ({ authedPage: page }) => {
	await page.emulateMedia({ colorScheme: "light" });
	await page.goto("/admin");
	const userMenu = page.getByTestId(MENU_ID);

	await expect(userMenu).toContainText(NAME);
	await expect(userMenu).toContainText(LAST_NAME);
	await expect(userMenu).toContainText(EMAIL);
	await expect(userMenu).toContainText(NAME.charAt(0) + LAST_NAME.charAt(0));

	expect(await userMenu.screenshot()).toMatchSnapshot();
});
test("dark theme visual comparison", async ({ authedPage: page }) => {
	await page.emulateMedia({ colorScheme: "dark" });
	await page.goto("/admin");
	const userMenu = page.getByTestId(MENU_ID);

	await expect(userMenu).toContainText(NAME);
	await expect(userMenu).toContainText(LAST_NAME);
	await expect(userMenu).toContainText(EMAIL);
	await expect(userMenu).toContainText(NAME.charAt(0) + LAST_NAME.charAt(0));

	expect(await userMenu.screenshot()).toMatchSnapshot();
});

test("light theme visual comparison dropdown", async ({ authedPage: page }) => {
	await page.emulateMedia({ colorScheme: "light" });
	await page.goto("/admin");

	const userMenu = page.getByTestId(MENU_ID);
	await userMenu.click();
	const dropdown = page.getByTestId(MENU_DROPDOWN_ID);

	expect(await dropdown.screenshot()).toMatchSnapshot();
});
test("dark theme visual comparison dropdown", async ({ authedPage: page }) => {
	await page.emulateMedia({ colorScheme: "dark" });
	await page.goto("/admin");

	const userMenu = page.getByTestId(MENU_ID);
	await userMenu.click();
	const dropdown = page.getByTestId(MENU_DROPDOWN_ID);

	expect(await dropdown.screenshot()).toMatchSnapshot();
});

test("signs out when button pressed", async ({ authedPage: page }) => {
	await page.goto("/admin");

	const userMenu = page.getByTestId(MENU_ID);
	await userMenu.click();
	const dropdown = page.getByTestId(MENU_DROPDOWN_ID);

	await dropdown.getByText("Sign out").click();
	await expect(page).toHaveURL("/admin/auth/signin");
});
