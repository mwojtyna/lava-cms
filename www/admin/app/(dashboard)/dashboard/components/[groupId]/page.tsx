import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { TableSearchParams } from "@/src/hooks";
import { caller } from "@/src/trpc/routes/private/_private";
import { type CookieName, tableCookieSchema } from "@/src/utils/cookies";
import { ComponentsTable } from "../ComponentsTable";

export const dynamic = "force-dynamic";

export default async function Group({
	params,
	searchParams,
}: {
	params: { groupId: string };
	searchParams: TableSearchParams;
}) {
	try {
		const data = await caller.components.getGroup({ id: params.groupId });
		const rawCookie = cookies().get("components-table" satisfies CookieName)?.value;
		const cookie = rawCookie ? await tableCookieSchema.parseAsync(JSON.parse(rawCookie)) : null;

		return <ComponentsTable data={data} pagination={searchParams} cookie={cookie} />;
	} catch (e) {
		notFound();
	}
}
