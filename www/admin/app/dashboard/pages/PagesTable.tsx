"use client";

import * as React from "react";
import type { Page } from "@prisma/client";
import { Button } from "@admin/src/components/ui/client";
import { DocumentPlusIcon, FolderPlusIcon } from "@heroicons/react/24/outline";
import { trpc } from "@admin/src/utils/trpc";
import { AddDialog } from "./dialogs";
import { DataTable, DataTableBreadcrumbs, DataTablePagination } from "@admin/src/components";
import type { PagesTableSearchParams } from "./page";
import { type TableCookie } from "@admin/src/utils/cookies";
import { useTable } from "@admin/src/hooks/useTable";
import { columns } from "./PagesTableColumns";

interface Props {
	group: Page;
	data: { pages: Page[]; breadcrumbs: Page[] };
	pagination: PagesTableSearchParams;
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
			contents: props.cookie,
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
				<div className="flex justify-between gap-2">
					{searchElement}

					<div className="flex gap-2">
						<Button
							onClick={() => setOpenAddPage(true)}
							icon={<DocumentPlusIcon className="w-5" />}
							data-testid="add-page"
						>
							Page
						</Button>
						<Button
							onClick={() => setOpenAddGroup(true)}
							variant={"secondary"}
							icon={<FolderPlusIcon className="w-5" />}
							data-testid="add-group"
						>
							Group
						</Button>
					</div>
				</div>

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
