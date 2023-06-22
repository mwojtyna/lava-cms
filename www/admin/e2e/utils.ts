import type { ColorTheme } from "@admin/src/data/stores/dashboard";
import type { Page } from "@playwright/test";

export const getColorScheme = (page: Page): Promise<ColorTheme> =>
	page.locator("body").evaluate((node) => (node.classList.contains("dark") ? "dark" : "light"));
