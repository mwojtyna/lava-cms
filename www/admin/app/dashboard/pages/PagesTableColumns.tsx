"use client";

import type { Page } from "@admin/../api/prisma/types";
import { DocumentIcon, FolderIcon } from "@heroicons/react/24/outline";
import type { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Page>[] = [
	{
		header: "Name",
		cell: ({ row }) => {
			return (
				<span className="flex items-center gap-3">
					{row.original.is_directory ? (
						<FolderIcon className="w-5 text-muted-foreground" />
					) : (
						<DocumentIcon className="w-5 text-muted-foreground" />
					)}
					{row.original.name}
				</span>
			);
		},
	},
	{
		header: "Path",
		accessorKey: "url",
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
];
