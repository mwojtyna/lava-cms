"use client";
import * as React from "react";
import Link from "next/link";
import { sortingFns, type ColumnDef } from "@tanstack/react-table";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import { CubeIcon, FolderIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { ComponentsTableItem } from "./ComponentsTable";
import {
	ActionIcon,
	Button,
	Checkbox,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@admin/src/components/ui/client";
import { DataTableSortableHeader, dateFormatOptions } from "@admin/src/components/DataTable";
import { DeleteDialog } from "./dialogs/SharedDialogs";

export const columns: ColumnDef<ComponentsTableItem>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				className="grid place-items-center"
				checked={table.getIsAllPageRowsSelected()}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				className="grid place-items-center"
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
		header: ({ column }) => <DataTableSortableHeader column={column} name="Name" />,
		accessorKey: "name",
		sortingFn: sortingFns.alphanumericCaseSensitive,
		size: 500,
		cell: ({ row }) => {
			return (
				<div className="flex items-center gap-3">
					{row.original.isGroup ? (
						<FolderIcon className="w-5 text-muted-foreground" />
					) : (
						<CubeIcon className="w-5 text-muted-foreground" />
					)}
					<Button variant={"link"} className="font-normal" asChild>
						<Link
							href={
								row.original.isGroup
									? `/dashboard/components/${row.original.id}`
									: // TODO: Open an edit sheet
									  `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
							}
						>
							{row.original.name}
						</Link>
					</Button>
				</div>
			);
		},
	},
	{
		id: "instances",
		header: ({ column }) => <DataTableSortableHeader column={column} name="Instances" />,
		cell: ({ row }) => (row.original.isGroup ? "-" : row.original.instances.length),
	},
	{
		id: "type",
		header: ({ column }) => <DataTableSortableHeader column={column} name="Type" />,
		accessorFn: (item) => {
			return item.isGroup ? "Group" : "Component Definition";
		},
	},
	{
		id: "last_updated",
		header: ({ column }) => <DataTableSortableHeader column={column} name="Last Updated" />,
		sortingFn: sortingFns.datetime,
		accessorFn: (item) =>
			new Intl.DateTimeFormat("en-GB", dateFormatOptions).format(item.lastUpdate),
	},
	{
		id: "actions",
		// header: ({ table }) =>
		// 	(table.getIsSomePageRowsSelected() || table.getIsAllPageRowsSelected()) && (
		// 		<PagesTableBulkActions
		// 			pages={table.getSelectedRowModel().flatRows.map((row) => row.original)}
		// 			onSubmit={table.resetRowSelection}
		// 		/>
		// 	),
		cell: ({ row }) => <ComponentsTableActions item={row.original} />,
		size: 0,
	},
];

function ComponentsTableActions({ item }: { item: ComponentsTableItem }) {
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
					<DropdownMenuItem
						className="text-destructive"
						onClick={() => setOpenDelete(true)}
					>
						<TrashIcon className="w-4" />
						<span>Delete</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<DeleteDialog item={item} open={openDelete} setOpen={setOpenDelete} />
		</>
	);
}
