"use client";

import type { inferRouterOutputs } from "@trpc/server";
import { CubeIcon } from "@heroicons/react/24/outline";
import * as React from "react";
import {
	DataTable,
	DataTableActions,
	DataTableBreadcrumbs,
	DataTablePagination,
} from "@/src/components";
import { useComponentsTableDialogs } from "@/src/data/stores/componentDefinitions";
import { useDataTable, type TableSearchParams } from "@/src/hooks";
import type { PrivateRouter } from "@/src/trpc/routes/private/_private";
import type { Item } from "@/src/trpc/routes/private/components/getGroup";
import type { TableCookie } from "@/src/utils/cookies";
import { trpc } from "@/src/utils/trpc";
import { columns } from "./ComponentsTableColumns";
import {
	AddComponentDefDialog,
	DuplicateComponentDefDialog,
	EditComponentDefDialog,
} from "./dialogs/component-definition";
import { AddGroupDialog, EditGroupDialog } from "./dialogs/GroupDialogs";
import { MoveDialog, DeleteDialog } from "./dialogs/SharedDialogs";

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
	const dialogs = useComponentsTableDialogs();

	return (
		<>
			<div className="flex flex-col gap-4" data-testid="component-definitions-table">
				<DataTableActions
					searchElement={searchElement}
					itemName="definition"
					itemIcon={<CubeIcon className="w-5" />}
					onAddItem={() => {
						setOpenAddComponentDef(true);
						useComponentsTableDialogs.setState({
							fields: [],
							originalFields: [],
						});
					}}
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

			{dialogs.item && !dialogs.item.isGroup && (
				<>
					<EditComponentDefDialog
						componentDef={dialogs.item}
						open={dialogs.editComponentDefDialog.isOpen}
						setOpen={dialogs.editComponentDefDialog.setIsOpen}
					/>
					<DuplicateComponentDefDialog
						componentDef={dialogs.item}
						open={dialogs.duplicateDialog.isOpen}
						setOpen={dialogs.duplicateDialog.setIsOpen}
					/>
				</>
			)}

			{dialogs.item && dialogs.item.isGroup && (
				<EditGroupDialog
					group={dialogs.item}
					open={dialogs.editGroupDialog.isOpen}
					setOpen={dialogs.editGroupDialog.setIsOpen}
				/>
			)}

			{dialogs.item && (
				<>
					<MoveDialog
						item={dialogs.item}
						open={dialogs.moveDialog.isOpen}
						setOpen={dialogs.moveDialog.setIsOpen}
					/>
					<DeleteDialog
						item={dialogs.item}
						open={dialogs.deleteDialog.isOpen}
						setOpen={dialogs.deleteDialog.setIsOpen}
					/>
				</>
			)}
		</>
	);
}
