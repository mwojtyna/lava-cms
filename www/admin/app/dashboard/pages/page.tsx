import { trpc } from "@admin/src/utils/trpc";
import { PagesTable } from "./PagesTable";
import { columns } from "./PagesTableColumns";

export const dynamic = "force-dynamic";

export default async function Pages() {
	const data = await trpc.pages.getGroupContents.query();

	return <PagesTable columns={columns} pages={data.pages} breadcrumbs={[]} />;
}
