"use client";

import type { Page } from "@prisma/client";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import {
	DocumentIcon,
	FolderIcon,
	FolderArrowDownIcon,
	TrashIcon,
	PencilSquareIcon,
	DocumentDuplicateIcon,
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
import { BulkDeleteDialog } from "./dialogs/bulk/BulkDeleteDialog";
import { BulkMoveDialog } from "./dialogs/bulk/BulkMoveDialog";
import { DuplicateDialog } from "./dialogs/page/DuplicateDialog";
import { DeleteDialog } from "./dialogs/shared/DeleteDialog";
import { EditDetailsDialog } from "./dialogs/shared/EditDetailsDialog";
import { MoveDialog } from "./dialogs/shared/MoveDialog";

export const columns: ColumnDef<Page>[] = [
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
		header: ({ column }) => <DataTableSortableHeader column={column} name="Name" />,
		cell: ({ row }) => (
			<div className="flex items-center gap-3">
				{row.original.is_group ? (
					<FolderIcon className="w-5 text-muted-foreground" />
				) : (
					<DocumentIcon className="w-5 text-muted-foreground" />
				)}
				<Button variant={"link"} className="font-normal" asChild>
					<Link
						href={
							row.original.is_group
								? `/dashboard/pages/${row.original.id}`
								: `/dashboard/pages/editor/${row.original.id}`
						}
					>
						{row.original.name}
					</Link>
				</Button>
			</div>
		),
	},
	{
		accessorKey: "url",
		header: ({ column }) => <DataTableSortableHeader column={column} name="Path" />,
		size: 500,
	},
	{
		accessorKey: "type",
		header: ({ column }) => <DataTableSortableHeader column={column} name="Type" />,
		accessorFn: (page) => {
			return page.is_group ? "Group" : "Page";
		},
	},
	{
		accessorKey: "last_updated",
		header: ({ column }) => <DataTableSortableHeader column={column} name="Last Updated" />,
		sortingFn: sortingFns.datetime,
		accessorFn: (page) =>
			new Intl.DateTimeFormat("en-GB", dateFormatOptions).format(page.last_update),
	},
	{
		id: "actions",
		header: ({ table }) =>
			(table.getIsSomePageRowsSelected() || table.getIsAllPageRowsSelected()) && (
				<PagesTableBulkActions
					pages={table.getSelectedRowModel().flatRows.map((row) => row.original)}
					onSubmit={table.resetRowSelection}
				/>
			),
		cell: ({ row }) => <PagesTableActions page={row.original} />,
		size: 0,
	},
];

function PagesTableActions({ page }: { page: Page }) {
	const [openEdit, setOpenEdit] = React.useState(false);
	const [openDuplicate, setOpenDuplicate] = React.useState(false);
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
					<DropdownMenuItem onClick={() => setOpenEdit(true)}>
						<PencilSquareIcon className="w-4" />
						<span>Edit details</span>
					</DropdownMenuItem>

					<DropdownMenuItem onClick={() => setOpenMove(true)}>
						<FolderArrowDownIcon className="w-4" />
						<span>Move</span>
					</DropdownMenuItem>

					{!page.is_group && (
						<DropdownMenuItem onClick={() => setOpenDuplicate(true)}>
							<DocumentDuplicateIcon className="w-4" />
							<span>Duplicate</span>
						</DropdownMenuItem>
					)}

					<DropdownMenuItem
						className="text-destructive"
						onClick={() => setOpenDelete(true)}
					>
						<TrashIcon className="w-4" />
						<span>Delete</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<EditDetailsDialog page={page} open={openEdit} setOpen={setOpenEdit} />
			<MoveDialog page={page} open={openMove} setOpen={setOpenMove} />
			{!page.is_group && (
				<DuplicateDialog page={page} open={openDuplicate} setOpen={setOpenDuplicate} />
			)}
			<DeleteDialog page={page} open={openDelete} setOpen={setOpenDelete} />
		</>
	);
}
function PagesTableBulkActions(props: { pages: Page[]; onSubmit: () => void }) {
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
				pages={props.pages}
				open={openMove}
				setOpen={setOpenMove}
				onSubmit={props.onSubmit}
			/>
			<BulkDeleteDialog
				pages={props.pages}
				open={openDelete}
				setOpen={setOpenDelete}
				onSubmit={props.onSubmit}
			/>
		</>
	);
}
