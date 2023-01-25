import { expect, test } from "@playwright/test";

test("redirects to sign in page when not signed in", async ({ page }) => {
	await page.goto("/admin");
	expect(page.url()).toMatch(/\/admin\/auth\/signin/);
});
