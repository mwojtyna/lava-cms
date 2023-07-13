import { z } from "zod";
import { getCookie } from "cookies-next";
import type { OptionsType } from "cookies-next/lib/types";

export type CookieName = "color-theme" | "pages-table";
export function getParsedCookie<T>(name: CookieName, fallback: T) {
	const cookie = getCookie(name)?.toString();
	if (!cookie) return fallback;

	return JSON.parse(cookie) as T;
}
export const permanentCookieOptions: OptionsType = {
	maxAge: new Date(2100, 12).getTime(),
	sameSite: "lax",
	path: "/admin",
};

export const colorThemeSchema = z.enum(["dark", "light"]);
export type ColorTheme = z.infer<typeof colorThemeSchema>;

export const tableCookieSchema = z.object({
	id: z.string(),
	desc: z.boolean(),
	pageSize: z.number(),
});
export type TableCookie = z.infer<typeof tableCookieSchema>;
