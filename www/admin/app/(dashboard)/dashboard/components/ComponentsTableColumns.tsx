"use client";

import * as React from "react";
import Link from "next/link";
import { sortingFns, type ColumnDef } from "@tanstack/react-table";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import {
	CubeIcon,
	DocumentDuplicateIcon,
	FolderArrowDownIcon,
	FolderIcon,
	PencilSquareIcon,
	TrashIcon,
} from "@heroicons/react/24/outline";
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
import { DeleteDialog, MoveDialog } from "./dialogs/SharedDialogs";
import { EditGroupDialog } from "./dialogs/GroupDialogs";
import { EditComponentDefDialog } from "./dialogs/component-definition";
import { BulkDeleteDialog, BulkMoveDialog } from "./dialogs/BulkDialogs";
import { DuplicateComponentDefDialog } from "./dialogs/component-definition";
import { useComponentDefEditDialogStore } from "@admin/src/data/stores/dashboard";

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
						onClick={() =>
							useComponentDefEditDialogStore.setState({
								id: row.original.id,
								open: true,
							})
						}
					>
						{row.original.name}
					</Button>
				)}
			</div>
		),
	},
	{
		accessorKey: "instances",
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
		header: ({ column }) => <DataTableSortableHeader column={column} name="Last Updated" />,
		sortingFn: sortingFns.datetime,
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
	const [openEditDef, setOpenEditDef] = React.useState(false);
	const [openEditGroup, setOpenEditGroup] = React.useState(false);
	const [openMove, setOpenMove] = React.useState(false);
	const [openDuplicate, setOpenDuplicate] = React.useState(false);
	const [openDelete, setOpenDelete] = React.useState(false);

	React.useEffect(() => {
		const unsub = useComponentDefEditDialogStore.subscribe((state) => {
			if (state.id === item.id) {
				setOpenEditDef(state.open);
			}
		});
		return unsub;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
							if (item.isGroup) {
								setOpenEditGroup(true);
							} else {
								setOpenEditDef(true);
							}
						}}
					>
						<PencilSquareIcon className="w-4" />
						<span>Edit</span>
					</DropdownMenuItem>

					<DropdownMenuItem onClick={() => setOpenMove(true)}>
						<FolderArrowDownIcon className="w-4" />
						<span>Move</span>
					</DropdownMenuItem>

					{!item.isGroup && (
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

			{item.isGroup ? (
				<EditGroupDialog group={item} open={openEditGroup} setOpen={setOpenEditGroup} />
			) : (
				<EditComponentDefDialog
					componentDef={item}
					open={openEditDef}
					setOpen={setOpenEditDef}
				/>
			)}

			<MoveDialog item={item} open={openMove} setOpen={setOpenMove} />
			{!item.isGroup && (
				<DuplicateComponentDefDialog
					componentDef={item}
					open={openDuplicate}
					setOpen={setOpenDuplicate}
				/>
			)}
			<DeleteDialog item={item} open={openDelete} setOpen={setOpenDelete} />
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
