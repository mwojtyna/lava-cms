import { expect } from "@playwright/test";
import { test } from "@admin/e2e/fixtures";
import { userMock } from "@admin/e2e/mocks";
import { getColorScheme } from "@admin/e2e/utils";

const MENU_ID = "user-menu";
const MENU_DROPDOWN_ID = "user-menu-dropdown";

// Check only dropdown because of different icons depending on theme
test("light theme visual comparison", async ({ authedPage: page }) => {
	await page.base.emulateMedia({ colorScheme: "light" });
	await page.goto("/admin/dashboard");

	const userMenu = page.base.getByTestId(MENU_ID).locator("visible=true");
	await userMenu.click();

	expect(await page.base.getByTestId(MENU_DROPDOWN_ID).screenshot()).toMatchSnapshot();
});
test("dark theme visual comparison", async ({ authedPage: page }) => {
	await page.base.emulateMedia({ colorScheme: "dark" });
	await page.goto("/admin/dashboard");

	const userMenu = page.base.getByTestId(MENU_ID).locator("visible=true");
	await userMenu.click();

	expect(await page.base.getByTestId(MENU_DROPDOWN_ID).screenshot()).toMatchSnapshot();
});

test("displays current user details", async ({ authedPage: page }) => {
	await page.goto("/admin/dashboard");
	const userMenu = page.base.getByTestId(MENU_ID).locator("visible=true");

	await expect(userMenu).toContainText(
		`${userMock.name.charAt(0)}${userMock.last_name.charAt(0)}`,
	);
	await expect(userMenu).toContainText(`${userMock.name} ${userMock.last_name}`);
	await expect(userMenu).toContainText(userMock.email);
});

test("changes color theme when button pressed", async ({ authedPage: page }) => {
	await page.goto("/admin/dashboard");

	const userMenu = page.base.getByTestId(MENU_ID).locator("visible=true");
	const userMenuDropdown = page.base.getByTestId(MENU_DROPDOWN_ID);

	await userMenu.click();
	await userMenuDropdown.locator("> [role='menuitem']").first().click();

	await expect(userMenuDropdown).toBeHidden();
	expect(await getColorScheme(page.base)).toBe("dark");

	await userMenu.click();
	await userMenuDropdown.locator("> [role='menuitem']").first().click();

	await expect(userMenuDropdown).toBeHidden();
	expect(await getColorScheme(page.base)).toBe("light");
});

test("signs out when button pressed", async ({ authedPage: page }) => {
	await page.goto("/admin/dashboard");

	await page.base.getByTestId(MENU_ID).locator("visible=true").click();
	await page.base.getByTestId(MENU_DROPDOWN_ID).locator("[role='menuitem']").last().click();

	await expect(page.base).toHaveURL("/admin/signin");
	await expect(page.base.getByTestId("sign-in")).toBeVisible();
});
