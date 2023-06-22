"use client";

import * as React from "react";
import Link from "next/link";
import type { Page } from "api/prisma/types";
import {
	DocumentIcon,
	FolderIcon,
	FolderArrowDownIcon,
	TrashIcon,
	PencilSquareIcon,
	DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { type Column, type ColumnDef, sortingFns } from "@tanstack/react-table";
import {
	ActionIcon,
	Button,
	Checkbox,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@admin/src/components/ui/client";
import {
	ChevronDownIcon,
	ChevronUpDownIcon,
	ChevronUpIcon,
	EllipsisHorizontalIcon,
} from "@heroicons/react/20/solid";
import {
	BulkDeleteDialog,
	BulkMoveDialog,
	DeleteDialog,
	DuplicateDialog,
	EditDetailsDialog,
	MoveDialog,
} from "./dialogs";

export const columns: ColumnDef<Page>[] = [
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
		header: ({ column }) => <SortableHeader column={column} name="Name" />,
		accessorKey: "name",
		sortingFn: sortingFns.alphanumericCaseSensitive,
		cell: ({ row }) => {
			return (
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
			);
		},
	},
	{
		header: ({ column }) => <SortableHeader column={column} name="Path" />,
		accessorKey: "url",
		size: 500,
	},
	{
		id: "type",
		header: ({ column }) => <SortableHeader column={column} name="Type" />,
		accessorFn: (page) => {
			return page.is_group ? "Group" : "Page";
		},
	},
	{
		id: "last_updated",
		header: ({ column }) => <SortableHeader column={column} name="Last Updated" />,
		sortingFn: sortingFns.datetime,
		accessorFn: (page) => {
			const options: Intl.DateTimeFormatOptions = {
				year: "numeric",
				month: "long",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			};
			return new Intl.DateTimeFormat("en-GB", options).format(page.last_update);
		},
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
			<DuplicateDialog page={page} open={openDuplicate} setOpen={setOpenDuplicate} />
			<DeleteDialog page={page} open={openDelete} setOpen={setOpenDelete} />
		</>
	);
}
function PagesTableBulkActions({ pages, onSubmit }: { pages: Page[]; onSubmit: () => void }) {
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
				pages={pages}
				open={openMove}
				setOpen={setOpenMove}
				onSubmit={onSubmit}
			/>
			<BulkDeleteDialog
				pages={pages}
				open={openDelete}
				setOpen={setOpenDelete}
				onSubmit={onSubmit}
			/>
		</>
	);
}

function SortableHeader({ column, name }: { column: Column<Page, unknown>; name: string }) {
	return (
		<Button
			className="-ml-3 h-fit px-3 py-2"
			variant={"ghost"}
			onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
		>
			{name}{" "}
			{column.getIsSorted() ? (
				column.getIsSorted() === "desc" ? (
					<ChevronUpIcon className="w-4" />
				) : (
					<ChevronDownIcon className="w-4" />
				)
			) : (
				<ChevronUpDownIcon className="w-4" />
			)}
		</Button>
	);
}
