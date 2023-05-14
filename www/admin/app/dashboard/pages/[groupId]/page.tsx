import { trpc } from "@admin/src/utils/trpc";
import { PagesTable } from "../PagesTable";
import { columns } from "../PagesTableColumns";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Group({ params }: { params: { groupId: string } }) {
	const { breadcrumbs, pages } = await trpc.pages.getGroup.query({ id: params.groupId });
	if (breadcrumbs.length === 0) {
		return notFound();
	}

	return (
		<PagesTable
			columns={columns}
			pages={pages}
			breadcrumbs={breadcrumbs}
			groupId={params.groupId}
		/>
	);
}
