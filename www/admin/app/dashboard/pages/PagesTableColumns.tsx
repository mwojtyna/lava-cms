"use client";

import Link from "next/link";
import type { Page } from "api/prisma/types";
import {
	DocumentIcon,
	FolderIcon,
	FolderArrowDownIcon,
	TrashIcon,
} from "@heroicons/react/24/outline";
import type { ColumnDef } from "@tanstack/react-table";
import {
	ActionIcon,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@admin/src/components/ui/client";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";

export const columns: ColumnDef<Page>[] = [
	{
		header: "Name",
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
		header: "Path",
		accessorKey: "url",
	},
	{
		header: "Type",
		accessorFn: (page) => {
			return page.is_group ? "Group" : "Page";
		},
	},
	{
		header: "Last update",
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
		cell: ({ row }) => (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<ActionIcon>
						<EllipsisHorizontalIcon className="w-5" />
					</ActionIcon>
				</DropdownMenuTrigger>

				<DropdownMenuContent>
					<DropdownMenuItem>
						<FolderArrowDownIcon className="w-4" /> Move
					</DropdownMenuItem>
					<DropdownMenuItem className="text-destructive">
						<TrashIcon className="w-4" /> Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		),
	},
];
