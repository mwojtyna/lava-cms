import { cookies } from "next/headers";
import { caller } from "@admin/src/trpc/routes/private/_private";
import { PagesTable } from "./PagesTable";
import { type CookieName, tableCookieSchema } from "@admin/src/utils/cookies";
import type { TableSearchParams } from "@admin/src/hooks";

export const dynamic = "force-dynamic";

export default async function Pages({ searchParams }: { searchParams: TableSearchParams }) {
	const rootGroup = await caller.pages.getGroup();
	const data = await caller.pages.getGroupContents();

	const rawCookie = cookies().get("pages-table" satisfies CookieName)?.value;
	const cookie = rawCookie ? await tableCookieSchema.parseAsync(JSON.parse(rawCookie)) : null;

	return (
		<PagesTable
			data={{ pages: data.pages, breadcrumbs: [] }}
			group={rootGroup!}
			pagination={searchParams}
			cookie={cookie}
		/>
	);
}
