import { cookies } from "next/headers";
import { caller } from "@admin/src/trpc/routes/private/_private";
import { PagesTable } from "./PagesTable";
import { columns } from "./PagesTableColumns";
import { type CookieName, tableCookieSchema } from "@admin/src/utils/cookies";

export const dynamic = "force-dynamic";

export type SearchParams =
	| {
			pageIndex?: number;
	  }
	| undefined;

export default async function Pages({ searchParams }: { searchParams: SearchParams }) {
	const rootGroup = await caller.pages.getGroup();
	const data = await caller.pages.getGroupContents();

	const rawCookie = cookies().get("pages-table" satisfies CookieName)?.value;
	const cookie = rawCookie ? await tableCookieSchema.parseAsync(JSON.parse(rawCookie)) : null;

	return (
		<PagesTable
			columns={columns}
			data={{ pages: data.pages, breadcrumbs: [] }}
			group={rootGroup!}
			pagination={searchParams}
			cookie={cookie}
		/>
	);
}
