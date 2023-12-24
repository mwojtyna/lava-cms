import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { TableSearchParams } from "@/src/hooks";
import { caller } from "@/src/trpc/routes/private/_private";
import { type CookieName, tableCookieSchema } from "@/src/utils/cookies";
import { PagesTable } from "../PagesTable";

export const metadata: Metadata = {
	title: "Pages - Lava CMS",
};
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
