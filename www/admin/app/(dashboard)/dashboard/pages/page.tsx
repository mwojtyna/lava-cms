import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { TableSearchParams } from "@/src/hooks/useDataTable";
import { caller } from "@/src/trpc/routes/private/_private";
import { type CookieName, tableCookieSchema } from "@/src/utils/cookies";
import { PagesTable } from "./PagesTable";

export const metadata: Metadata = {
	title: "Pages - Lava CMS",
};
export const dynamic = "force-dynamic";

export default async function Pages({ searchParams }: { searchParams: TableSearchParams }) {
	const rootGroup = await caller.pages.getGroup();
	const data = await caller.pages.getGroupContents();

	const rawCookie = cookies().get("pages-table" satisfies CookieName)?.value;
	const cookie = rawCookie ? await tableCookieSchema.parseAsync(JSON.parse(rawCookie)) : null;

	return (
		<PagesTable
			data={{ pages: data.pages, breadcrumbs: [] }}
			group={rootGroup}
			pagination={searchParams}
			cookie={cookie}
		/>
	);
}
