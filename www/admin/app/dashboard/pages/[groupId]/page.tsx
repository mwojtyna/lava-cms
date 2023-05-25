import { trpc } from "@admin/src/utils/trpc";
import { PagesTable } from "../PagesTable";
import { columns } from "../PagesTableColumns";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Group({ params }: { params: { groupId: string } }) {
	const group = await trpc.pages.getGroup.query({ id: params.groupId });
	if (!group) {
		return notFound();
	}
	const { breadcrumbs, pages } = await trpc.pages.getGroupContents.query({ id: params.groupId });

	return <PagesTable columns={columns} data={{ pages, breadcrumbs }} group={group} />;
}
