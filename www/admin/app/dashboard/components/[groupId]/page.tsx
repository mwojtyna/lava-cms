import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { TableSearchParams } from "@admin/src/hooks";
import { caller } from "@admin/src/trpc/routes/private/_private";
import { type CookieName, tableCookieSchema } from "@admin/src/utils/cookies";
import { ComponentsTable } from "../ComponentsTable";

export const dynamic = "force-dynamic";

export default async function Group({
	params,
	searchParams,
}: {
	params: { groupId: string };
	searchParams: TableSearchParams;
}) {
	const { group, breadcrumbs } = await caller.components.getGroup({ id: params.groupId });
	if (!group) {
		notFound();
	}

	const rawCookie = cookies().get("components-table" satisfies CookieName)?.value;
	const cookie = rawCookie ? await tableCookieSchema.parseAsync(JSON.parse(rawCookie)) : null;

	return (
		<ComponentsTable data={{ group, breadcrumbs }} pagination={searchParams} cookie={cookie} />
	);
}
