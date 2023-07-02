import { caller } from "@admin/src/trpc/routes/private/_private";
import { cookies } from "next/headers";
import { PagesTable } from "../PagesTable";
import { columns } from "../PagesTableColumns";
import { notFound } from "next/navigation";
import type { SearchParams } from "../page";
import { type CookieName, tableCookieSchema } from "@admin/src/utils/cookies";

export const dynamic = "force-dynamic";

export default async function Group({
	params,
	searchParams,
}: {
	params: { groupId: string };
	searchParams: SearchParams;
}) {
	const group = await caller.pages.getGroup({ id: params.groupId });
	if (!group) {
		return notFound();
	}
	const { breadcrumbs, pages } = await caller.pages.getGroupContents({ id: params.groupId });

	const rawCookie = cookies().get("pages-table" satisfies CookieName)?.value;
	const cookie = rawCookie ? await tableCookieSchema.parseAsync(JSON.parse(rawCookie)) : null;

	return (
		<PagesTable
			columns={columns}
			data={{ pages, breadcrumbs }}
			group={group}
			pagination={searchParams}
			cookie={cookie}
		/>
	);
}