"use client";

import type { inferRouterOutputs } from "@trpc/server";
import { CubeIcon } from "@heroicons/react/24/outline";
import * as React from "react";
import {
	DataTableActions,
	DataTableBreadcrumbs,
	DataTable,
	DataTablePagination,
} from "@/src/components/DataTable";
import { useComponentsTableDialogsStore } from "@/src/data/stores/componentDefinitions";
import { useDataTable, type TableSearchParams } from "@/src/hooks/useDataTable";
import type { PrivateRouter } from "@/src/trpc/routes/private/_private";
import type { GroupItem } from "@/src/trpc/routes/private/components/types";
import type { TableCookie } from "@/src/utils/cookies";
import { trpc } from "@/src/utils/trpc";
import { columns } from "./ComponentsTableColumns";
import { AddComponentDefDialog } from "./dialogs/component-definition/AddComponentDefDialog";
import { DuplicateComponentDefDialog } from "./dialogs/component-definition/DuplicateComponentDefDialog";
import { EditComponentDefDialog } from "./dialogs/component-definition/EditComponentDefDialog";
import { AddGroupDialog, EditGroupDialog } from "./dialogs/GroupDialogs";
import { MoveDialog, DeleteDialog } from "./dialogs/SharedDialogs";

export type ComponentsTableItem = GroupItem;
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
	const store = useComponentsTableDialogsStore((state) => ({
		item: state.item,
		editComponentDefDialog: state.editComponentDefDialog,
		duplicateDialog: state.duplicateDialog,
		editGroupDialog: state.editGroupDialog,
		moveDialog: state.moveDialog,
		deleteDialog: state.deleteDialog,
	}));

	return (
		<>
			<div className="flex flex-col gap-4" data-testid="component-definitions-table">
				<DataTableActions
					searchElement={searchElement}
					itemName="definition"
					itemIcon={<CubeIcon className="w-5" />}
					onAddItem={() => {
						setOpenAddComponentDef(true);
						useComponentsTableDialogsStore.setState({
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

			{store.item && !store.item.isGroup && (
				<>
					<EditComponentDefDialog
						componentDef={store.item}
						open={store.editComponentDefDialog.isOpen}
						setOpen={store.editComponentDefDialog.setIsOpen}
					/>
					<DuplicateComponentDefDialog
						componentDef={store.item}
						open={store.duplicateDialog.isOpen}
						setOpen={store.duplicateDialog.setIsOpen}
					/>
				</>
			)}

			{store.item && store.item.isGroup && (
				<EditGroupDialog
					group={store.item}
					open={store.editGroupDialog.isOpen}
					setOpen={store.editGroupDialog.setIsOpen}
				/>
			)}

			{store.item && (
				<>
					<MoveDialog
						item={store.item}
						open={store.moveDialog.isOpen}
						setOpen={store.moveDialog.setIsOpen}
					/>
					<DeleteDialog
						item={store.item}
						open={store.deleteDialog.isOpen}
						setOpen={store.deleteDialog.setIsOpen}
					/>
				</>
			)}
		</>
	);
}
