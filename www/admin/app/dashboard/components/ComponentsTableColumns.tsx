import Link from "next/link";
import { sortingFns, type ColumnDef } from "@tanstack/react-table";
import type { ComponentsTableItem } from "./ComponentsTable";
import { Button, Checkbox } from "@admin/src/components/ui/client";
import { CubeIcon, FolderIcon } from "@heroicons/react/24/outline";
import { DataTableSortableHeader } from "@admin/src/components/DataTable";

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
		accessorFn: (item) => {
			const options: Intl.DateTimeFormatOptions = {
				year: "numeric",
				month: "long",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			};
			return new Intl.DateTimeFormat("en-GB", options).format(item.lastUpdate);
		},
	},
];
