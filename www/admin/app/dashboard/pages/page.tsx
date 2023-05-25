import { trpc } from "@admin/src/utils/trpc";
import { PagesTable } from "./PagesTable";
import { columns } from "./PagesTableColumns";

export const dynamic = "force-dynamic";

export type SearchParams =
	| {
			pageIndex?: number;
	  }
	| undefined;

export default async function Pages({ searchParams }: { searchParams: SearchParams }) {
	const rootGroup = await trpc.pages.getGroup.query();
	const data = await trpc.pages.getGroupContents.query();

	return (
		<PagesTable
			columns={columns}
			data={{ pages: data.pages, breadcrumbs: [] }}
			group={rootGroup!}
			searchParams={searchParams}
		/>
	);
}
