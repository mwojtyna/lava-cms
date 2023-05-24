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
} from "@heroicons/react/24/outline";
import type { Column, ColumnDef } from "@tanstack/react-table";
import {
	ActionIcon,
	Button,
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
import { DeleteDialog, EditDetailsDialog, MoveDialog } from "./dialogs";

export const columns: ColumnDef<Page>[] = [
	{
		header: ({ column }) => <SortableHeader column={column} name="Name" />,
		accessorKey: "name",
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
		cell: ({ row }) => <PagesTableActions page={row.original} />,
	},
];

function PagesTableActions({ page }: { page: Page }) {
	const [openDelete, setOpenDelete] = React.useState(false);
	const [openMove, setOpenMove] = React.useState(false);
	const [openEdit, setOpenEdit] = React.useState(false);

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
			<DeleteDialog page={page} open={openDelete} setOpen={setOpenDelete} />
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
