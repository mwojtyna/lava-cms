import { z } from "zod";
import { getCookie } from "cookies-next";

export type CookieName = "color-theme" | "pages-table";

export function getParsedCookie<T>(name: CookieName, fallback: T) {
	const cookie = getCookie(name)?.toString();
	if (!cookie) return fallback;

	return JSON.parse(cookie) as T;
}

export const tableCookieSchema = z.object({
	id: z.string(),
	desc: z.boolean(),
	pageSize: z.number(),
});
export type TableCookie = z.infer<typeof tableCookieSchema>;
