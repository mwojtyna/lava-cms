"use client";

import type { Page } from "@prisma/client";
import type { inferRouterOutputs } from "@trpc/server";
import { DocumentIcon } from "@heroicons/react/24/outline";
import * as React from "react";
import {
	DataTable,
	DataTableBreadcrumbs,
	DataTablePagination,
	DataTableActions,
} from "@/src/components/DataTable";
import { type TableSearchParams, useDataTable } from "@/src/hooks/useDataTable";
import type { PrivateRouter } from "@/src/trpc/routes/private/_private";
import { type TableCookie } from "@/src/utils/cookies";
import { trpc } from "@/src/utils/trpc";
import { AddDialog } from "./dialogs/shared/AddDialog";
import { columns } from "./PagesTableColumns";

interface Props {
	group: Page;
	data: inferRouterOutputs<PrivateRouter>["pages"]["getGroupContents"];
	pagination: TableSearchParams;
	cookie: TableCookie | null;
}

export function PagesTable(props: Props) {
	const data = trpc.pages.getGroupContents.useQuery(
		props.data.breadcrumbs.length > 0 ? { id: props.group.id } : null,
		{ initialData: props.data },
	).data;

	const { table, searchElement } = useDataTable({
		data: data.pages,
		columns,
		cookie: {
			name: "pages-table",
			serverContents: props.cookie,
			default: { id: "name", desc: false, pageSize: 10 },
		},
		pagination: {
			pageIndex: props.pagination?.pageIndex ?? 0,
		},
		searchColumn: "name",
	});

	const [openAddPage, setOpenAddPage] = React.useState(false);
	const [openAddGroup, setOpenAddGroup] = React.useState(false);

	return (
		<>
			<div className="flex flex-col gap-4" data-testid="pages-table">
				<DataTableActions
					searchElement={searchElement}
					itemName="page"
					itemIcon={<DocumentIcon className="w-5" />}
					onAddItem={() => setOpenAddPage(true)}
					onAddGroup={() => setOpenAddGroup(true)}
				/>

				<DataTableBreadcrumbs breadcrumbs={data.breadcrumbs} rootUrl="/dashboard/pages" />
				<DataTable table={table} columns={columns} />
				<DataTablePagination table={table} />
			</div>

			<AddDialog
				isGroup={false}
				group={props.group}
				open={openAddPage}
				setOpen={setOpenAddPage}
			/>
			<AddDialog
				isGroup={true}
				group={props.group}
				open={openAddGroup}
				setOpen={setOpenAddGroup}
			/>
		</>
	);
}
