"use client";

import type { ComponentsTableItem } from "./ComponentsTable";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import {
	CubeIcon,
	DocumentDuplicateIcon,
	FolderArrowDownIcon,
	FolderIcon,
	PencilSquareIcon,
	TrashIcon,
} from "@heroicons/react/24/outline";
import { sortingFns, type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import * as React from "react";
import { DataTableSortableHeader, dateFormatOptions } from "@/src/components/DataTable";
import { ActionIcon } from "@/src/components/ui/client/ActionIcon";
import { Button } from "@/src/components/ui/client/Button";
import { Checkbox } from "@/src/components/ui/client/Checkbox";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/src/components/ui/client/DropdownMenu";
import { useComponentsTableDialogsStore } from "@/src/data/stores/componentDefinitions";
import { BulkDeleteDialog, BulkMoveDialog } from "./dialogs/BulkDialogs";

export const columns: ColumnDef<ComponentsTableItem>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected()}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableColumnFilter: false,
		enableGlobalFilter: false,
		size: 0,
	},
	{
		accessorKey: "name",
		sortingFn: sortingFns.alphanumeric,
		size: 500,
		header: ({ column }) => <DataTableSortableHeader column={column} name="Name" />,
		cell: ({ row }) => (
			<div className="flex items-center gap-3">
				{row.original.isGroup ? (
					<FolderIcon className="w-5 text-muted-foreground" />
				) : (
					<CubeIcon className="w-5 text-muted-foreground" />
				)}

				{row.original.isGroup ? (
					<Button variant={"link"} className="font-normal" asChild>
						<Link href={`/dashboard/components/${row.original.id}`}>
							{row.original.name}
						</Link>
					</Button>
				) : (
					<Button
						variant={"link"}
						className="font-normal"
						onClick={() => {
							const state = useComponentsTableDialogsStore.getState();
							state.editComponentDefDialog.setIsOpen(true);
							state.setItem(row.original);
						}}
					>
						{row.original.name}
					</Button>
				)}
			</div>
		),
	},
	{
		accessorKey: "instances",
		sortingFn: sortingFns.alphanumeric,
		header: ({ column }) => <DataTableSortableHeader column={column} name="Instances" />,
		cell: ({ row }) => (row.original.isGroup ? "-" : row.original.instances.length),
	},
	{
		accessorKey: "type",
		header: ({ column }) => <DataTableSortableHeader column={column} name="Type" />,
		accessorFn: (item) => {
			return item.isGroup ? "Group" : "Component Definition";
		},
	},
	{
		accessorKey: "last_updated",
		sortingFn: sortingFns.datetime,
		header: ({ column }) => <DataTableSortableHeader column={column} name="Last Updated" />,
		accessorFn: (item) =>
			new Intl.DateTimeFormat("en-GB", dateFormatOptions).format(item.lastUpdate),
	},
	{
		id: "actions",
		header: ({ table }) =>
			(table.getIsSomePageRowsSelected() || table.getIsAllPageRowsSelected()) && (
				<ComponentsTableBulkActions
					items={table.getSelectedRowModel().flatRows.map((row) => row.original)}
					onSubmit={table.resetRowSelection}
				/>
			),
		cell: ({ row }) => <ComponentsTableActions item={row.original} />,
		size: 0,
	},
];

function ComponentsTableActions({ item }: { item: ComponentsTableItem }) {
	const dialogs = useComponentsTableDialogsStore((state) => ({
		setItem: state.setItem,
		editComponentDefDialog: state.editComponentDefDialog,
		editGroupDialog: state.editGroupDialog,
		duplicateDialog: state.duplicateDialog,
		moveDialog: state.moveDialog,
		deleteDialog: state.deleteDialog,
	}));

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<ActionIcon>
						<EllipsisHorizontalIcon className="w-5" />
					</ActionIcon>
				</DropdownMenuTrigger>

				<DropdownMenuContent>
					<DropdownMenuItem
						onClick={() => {
							dialogs.setItem(item);
							if (item.isGroup) {
								dialogs.editGroupDialog.setIsOpen(true);
							} else {
								dialogs.editComponentDefDialog.setIsOpen(true);
							}
						}}
					>
						<PencilSquareIcon className="w-4" />
						<span>Edit</span>
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={() => {
							dialogs.moveDialog.setIsOpen(true);
							dialogs.setItem(item);
						}}
					>
						<FolderArrowDownIcon className="w-4" />
						<span>Move</span>
					</DropdownMenuItem>

					{!item.isGroup && (
						<DropdownMenuItem
							onClick={() => {
								dialogs.duplicateDialog.setIsOpen(true);
								dialogs.setItem(item);
							}}
						>
							<DocumentDuplicateIcon className="w-4" />
							<span>Duplicate</span>
						</DropdownMenuItem>
					)}

					<DropdownMenuItem
						className="text-destructive"
						onClick={() => {
							dialogs.deleteDialog.setIsOpen(true);
							dialogs.setItem(item);
						}}
					>
						<TrashIcon className="w-4" />
						<span>Delete</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
function ComponentsTableBulkActions(props: { items: ComponentsTableItem[]; onSubmit: () => void }) {
	const [openMove, setOpenMove] = React.useState(false);
	const [openDelete, setOpenDelete] = React.useState(false);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<ActionIcon>
						<EllipsisHorizontalIcon className="w-5" />
					</ActionIcon>
				</DropdownMenuTrigger>

				<DropdownMenuContent>
					<DropdownMenuItem onClick={() => setOpenMove(true)}>
						<FolderArrowDownIcon className="w-4" />
						<span>Move</span>
					</DropdownMenuItem>

					<DropdownMenuItem
						className="text-destructive"
						onClick={() => setOpenDelete(true)}
					>
						<TrashIcon className="w-4" />
						<span>Delete</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<BulkMoveDialog
				items={props.items}
				open={openMove}
				setOpen={setOpenMove}
				onSubmit={props.onSubmit}
			/>
			<BulkDeleteDialog
				items={props.items}
				open={openDelete}
				setOpen={setOpenDelete}
				onSubmit={props.onSubmit}
			/>
		</>
	);
}
