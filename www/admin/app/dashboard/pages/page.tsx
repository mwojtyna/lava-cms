import { trpc } from "@admin/src/utils/trpc";
import { PagesTable } from "./PagesTable";
import { columns } from "./PagesTableColumns";

export const dynamic = "force-dynamic";

export default async function Pages() {
	const pages = await trpc.pages.getTopLevelPages.query();

	return <PagesTable columns={columns} data={pages} />;
}
