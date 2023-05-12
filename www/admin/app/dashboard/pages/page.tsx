import { trpc } from "@admin/src/utils/trpc";
import { PagesTable } from "./PagesTable";
import { columns } from "./PagesTableColumns";
import { PagesTableActions } from "./PagesTableActions";

export default async function Pages() {
	const pages = await trpc.pages.getTopLevelPages.query();

	return (
		<div className="flex flex-col gap-4">
			<PagesTableActions />
			<PagesTable columns={columns} data={pages} />
		</div>
	);
}
