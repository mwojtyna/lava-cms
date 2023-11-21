import { z } from "zod";
import { getCookie } from "cookies-next";
import type { OptionsType } from "cookies-next/lib/types";

export type CookieName = "color-theme" | "pages-table" | "components-table";

/**
 * Get a cookie as a JSON object
 * @param fallback The fallback value if the cookie is not found
 **/
export function getJsonCookie<T>(name: CookieName, fallback: T) {
	const cookie = getCookie(name)?.toString();
	if (!cookie) {
		return fallback;
	}

	return JSON.parse(cookie) as T;
}
export const permanentCookieOptions: OptionsType = {
	expires: new Date(2100, 11),
	sameSite: "lax",
	path: "/admin",
};

// ---------- SCHEMAS ----------

export const colorThemeSchema = z.enum(["dark", "light"]);
export type ColorTheme = z.infer<typeof colorThemeSchema>;

export const tableCookieSchema = z.object({
	id: z.string(),
	desc: z.boolean(),
	pageSize: z.number(),
});
export type TableCookie = z.infer<typeof tableCookieSchema>;
