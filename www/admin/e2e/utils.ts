import type { Page } from "@playwright/test";
import type { ColorTheme } from "@/src/utils/cookies";

export function getColorScheme(page: Page): Promise<ColorTheme> {
	return page
		.locator("body")
		.evaluate((node) => (node.classList.contains("dark") ? "dark" : "light"));
}
