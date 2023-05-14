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
import type { ColumnDef } from "@tanstack/react-table";
import {
	ActionIcon,
	Button,
	Dialog,
	DialogContent,
	DialogTrigger,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@admin/src/components/ui/client";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import { trpcReact } from "@admin/src/utils/trpcReact";

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
		cell: ({ row }) => <PagesTableActions page={row.original} />,
	},
];

function PagesTableActions({ page }: { page: Page }) {
	const [openDelete, setOpenDelete] = React.useState<boolean>(false);
	const deleteMutation = trpcReact.pages.deletePage.useMutation();
	async function handleDelete() {
		await deleteMutation.mutateAsync({
			id: page.id,
		});
		setOpenDelete(false);
	}

	return (
		<Dialog open={openDelete} onOpenChange={setOpenDelete}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<ActionIcon>
						<EllipsisHorizontalIcon className="w-5" />
					</ActionIcon>
				</DropdownMenuTrigger>

				<DropdownMenuContent>
					<DropdownMenuItem>
						<PencilSquareIcon className="w-4" />
						<span>Edit details</span>
					</DropdownMenuItem>

					<DropdownMenuItem>
						<FolderArrowDownIcon className="w-4" />
						<span>Move</span>
					</DropdownMenuItem>

					<DialogTrigger asChild>
						<DropdownMenuItem className="text-destructive">
							<TrashIcon className="w-4" />
							<span>Delete</span>
						</DropdownMenuItem>
					</DialogTrigger>
				</DropdownMenuContent>
			</DropdownMenu>

			<DialogContent className="!max-w-md">
				<DialogHeader>
					<DialogTitle>Delete {page.is_group ? "group" : "page"}?</DialogTitle>
					<DialogDescription>
						{page.is_group
							? "Are you sure you want to delete the group and all its pages? This action cannot be undone!"
							: "Are you sure you want to delete the page? This action cannot be undone!"}
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button variant={"ghost"} onClick={() => setOpenDelete(false)}>
						No, don&apos;t delete
					</Button>
					<Button
						loading={deleteMutation.isLoading}
						type="submit"
						variant={"destructive"}
						onClick={handleDelete}
					>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
