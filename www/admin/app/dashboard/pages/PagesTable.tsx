"use client";

import * as React from "react";
import type { Page } from "@prisma/client";
import { DocumentIcon } from "@heroicons/react/24/outline";
import { trpc } from "@admin/src/utils/trpc";
import { AddDialog } from "./dialogs";
import {
	DataTable,
	DataTableBreadcrumbs,
	DataTablePagination,
	DataTableActions,
} from "@admin/src/components";
import { useTable, type TableSearchParams } from "@admin/src/hooks";
import { type TableCookie } from "@admin/src/utils/cookies";
import { columns } from "./PagesTableColumns";
import type { caller } from "@admin/src/trpc/routes/private/_private";

interface Props {
	group: Page;
	data: Awaited<ReturnType<typeof caller.pages.getGroupContents>>;
	pagination: TableSearchParams;
	cookie: TableCookie | null;
}

export function PagesTable(props: Props) {
	const data = trpc.pages.getGroupContents.useQuery(
		props.data.breadcrumbs.length > 0 ? { id: props.group.id } : null,
		{ initialData: props.data },
	).data;

	const { table, searchElement } = useTable({
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
