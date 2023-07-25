import { caller } from "@admin/src/trpc/routes/private/_private";
import { cookies } from "next/headers";
import { PagesTable } from "../PagesTable";
import { notFound } from "next/navigation";
import type { TableSearchParams } from "@admin/src/hooks";
import { type CookieName, tableCookieSchema } from "@admin/src/utils/cookies";

export const dynamic = "force-dynamic";

export default async function Group({
	params,
	searchParams,
}: {
	params: { groupId: string };
	searchParams: TableSearchParams;
}) {
	const group = await caller.pages.getGroup({ id: params.groupId });
	if (!group) {
		notFound();
	}
	const { breadcrumbs, pages } = await caller.pages.getGroupContents({ id: params.groupId });

	const rawCookie = cookies().get("pages-table" satisfies CookieName)?.value;
	const cookie = rawCookie ? await tableCookieSchema.parseAsync(JSON.parse(rawCookie)) : null;

	return (
		<PagesTable
			data={{ pages, breadcrumbs }}
			group={group}
			pagination={searchParams}
			cookie={cookie}
		/>
	);
}
