import { cookies } from "next/headers";
import { type CookieName, tableCookieSchema } from "@admin/src/utils/cookies";
import { ComponentsTable } from "./ComponentsTable";
import { caller } from "@admin/src/trpc/routes/private/_private";

export const dynamic = "force-dynamic";

export type ComponentsTableSearchParams =
	| {
			pageIndex?: number;
	  }
	| undefined;

export default async function Components({
	searchParams,
}: {
	searchParams: ComponentsTableSearchParams;
}) {
	const data = await caller.components.getGroup();
	const rawCookie = cookies().get("components-table" satisfies CookieName)?.value;
	const cookie = rawCookie ? await tableCookieSchema.parseAsync(JSON.parse(rawCookie)) : null;

	return <ComponentsTable data={data} pagination={searchParams} cookie={cookie} />;
}
