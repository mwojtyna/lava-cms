import { cookies } from "next/headers";
import { trpc } from "@admin/src/utils/trpc";
import { PagesTable } from "./PagesTable";
import { columns } from "./PagesTableColumns";
import { tableSortingSchema } from "@admin/src/types/cookies";

export const dynamic = "force-dynamic";

export type SearchParams =
	| {
			pageIndex?: number;
	  }
	| undefined;

export default async function Pages({ searchParams }: { searchParams: SearchParams }) {
	const rootGroup = await trpc.pages.getGroup.query();
	const data = await trpc.pages.getGroupContents.query();

	const rawCookie = cookies().get("pages-table")?.value;
	const cookie = rawCookie ? await tableSortingSchema.parseAsync(JSON.parse(rawCookie)) : null;

	return (
		<PagesTable
			columns={columns}
			data={{ pages: data.pages, breadcrumbs: [] }}
			group={rootGroup!}
			pagination={searchParams}
			sorting={cookie}
		/>
	);
}
