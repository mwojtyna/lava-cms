"use client";

import type { inferRouterOutputs } from "@trpc/server";
import { CubeIcon } from "@heroicons/react/24/outline";
import * as React from "react";
import {
	DataTable,
	DataTableActions,
	DataTableBreadcrumbs,
	DataTablePagination,
} from "@admin/src/components";
import { useDataTable, type TableSearchParams } from "@admin/src/hooks";
import type { PrivateRouter } from "@admin/src/trpc/routes/private/_private";
import type { Item } from "@admin/src/trpc/routes/private/components/getGroup";
import type { TableCookie } from "@admin/src/utils/cookies";
import { trpc } from "@admin/src/utils/trpc";
import { columns } from "./ComponentsTableColumns";
import { AddComponentDefDialog } from "./dialogs/component-definition";
import { AddGroupDialog } from "./dialogs/GroupDialogs";

export type ComponentsTableItem = Item;
export type ComponentsTableComponentDef = Omit<
	Extract<ComponentsTableItem, { isGroup: false }>,
	"isGroup"
>;
export type ComponentsTableGroup = Omit<Extract<ComponentsTableItem, { isGroup: true }>, "isGroup">;

interface Props {
	data: inferRouterOutputs<PrivateRouter>["components"]["getGroup"];
	pagination: TableSearchParams;
	cookie: TableCookie | null;
}
export function ComponentsTable(props: Props) {
	const data = trpc.components.getGroup.useQuery(
		props.data.breadcrumbs.length > 0 ? { id: props.data.group.id } : null,
		{ initialData: props.data },
	).data;

	const tableData = data.items;
	const { table, searchElement } = useDataTable({
		data: tableData,
		columns,
		cookie: {
			name: "components-table",
			serverContents: props.cookie,
			default: { id: "name", desc: false, pageSize: 10 },
		},
		pagination: {
			pageIndex: props.pagination?.pageIndex ?? 0,
		},
		searchColumn: "name",
	});

	const [openAddComponentDef, setOpenAddComponentDef] = React.useState(false);
	const [openAddGroup, setOpenAddGroup] = React.useState(false);

	return (
		<>
			<div className="flex flex-col gap-4" data-testid="component-definitions-table">
				<DataTableActions
					searchElement={searchElement}
					itemName="definition"
					itemIcon={<CubeIcon className="w-5" />}
					onAddItem={() => setOpenAddComponentDef(true)}
					onAddGroup={() => setOpenAddGroup(true)}
				/>

				<DataTableBreadcrumbs
					breadcrumbs={data.breadcrumbs}
					rootUrl="/dashboard/components"
				/>
				<DataTable table={table} columns={columns} />
				<DataTablePagination table={table} />
			</div>

			<AddComponentDefDialog
				group={props.data.group}
				open={openAddComponentDef}
				setOpen={setOpenAddComponentDef}
			/>
			<AddGroupDialog
				group={props.data.group}
				open={openAddGroup}
				setOpen={setOpenAddGroup}
			/>
		</>
	);
}
