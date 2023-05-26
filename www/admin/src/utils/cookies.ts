import { z } from "zod";
import { getCookie } from "cookies-next";

export type CookieName = "cookie-theme" | "pages-table";

export function getParsedCookie<T>(name: CookieName, fallback: T) {
	const cookie = getCookie(name)?.toString();
	if (!cookie) return fallback;

	return JSON.parse(cookie) as T;
}

export const tableSortingSchema = z
	.object({
		id: z.string(),
		desc: z.boolean(),
	})
	.nullable();
export type TableSorting = z.infer<typeof tableSortingSchema>;
