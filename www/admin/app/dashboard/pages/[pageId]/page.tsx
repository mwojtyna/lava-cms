import { trpc } from "@admin/src/utils/trpc";
import { PagesTable } from "../PagesTable";
import { columns } from "../PagesTableColumns";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Group({ params }: { params: { pageId: string } }) {
	const { group, pages } = await trpc.pages.getGroup.query({ id: params.pageId });
	if (!group) {
		return notFound();
	}

	return <PagesTable columns={columns} data={pages} />;
}
