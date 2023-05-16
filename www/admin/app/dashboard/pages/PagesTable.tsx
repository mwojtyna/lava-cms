"use client";

import * as React from "react";
import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	useReactTable,
	getFilteredRowModel,
} from "@tanstack/react-table";
import {
	Stepper,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@admin/src/components/ui/server";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import type { Page } from "api/prisma/types";
import { cn } from "@admin/src/utils/styling";
import { ActionIcon, Button, Input } from "@admin/src/components/ui/client";
import {
	DocumentPlusIcon,
	FolderPlusIcon,
	HomeIcon,
	MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { trpcReact } from "@admin/src/utils/trpcReact";

interface PagesTableProps {
	columns: ColumnDef<Page>[];
	pages: Page[];
	breadcrumbs: Page[];
	groupId?: string;
}

export function PagesTable(props: PagesTableProps) {
	const clientData = trpcReact.pages.getGroupContents.useQuery(
		props.groupId ? { id: props.groupId } : null
	);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

	const table = useReactTable({
		data: clientData.data?.pages ?? props.pages,
		columns: props.columns,
		getCoreRowModel: getCoreRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			columnFilters,
		},
	});

	return (
		<div className="flex flex-col gap-2">
			<div className="mb-2 flex justify-between gap-2">
				<Input
					value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
					onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
					icon={<MagnifyingGlassIcon className="w-4" />}
				/>

				<div className="flex gap-2">
					<Button icon={<DocumentPlusIcon className="w-5" />}>Page</Button>
					<Button variant={"secondary"} icon={<FolderPlusIcon className="w-5" />}>
						Group
					</Button>
				</div>
			</div>

			{props.breadcrumbs.length > 0 && (
				<Stepper
					steps={[
						<Link key={0} href={"/dashboard/pages"}>
							<ActionIcon className="-mr-2">
								<HomeIcon className="w-5 text-foreground" />
							</ActionIcon>
						</Link>,
						...props.breadcrumbs.map((breadcrumb, i) => (
							<Button
								key={i + 1}
								asChild
								variant={"link"}
								className={cn(
									"whitespace-nowrap font-normal",
									i < props.breadcrumbs.length - 1 && "text-muted-foreground"
								)}
							>
								<Link key={i} href={`/dashboard/pages/${breadcrumb.id}`}>
									{breadcrumb.name}
								</Link>
							</Button>
						)),
					]}
					currentStep={props.breadcrumbs.length}
					separator={<ChevronRightIcon className="w-4" />}
				/>
			)}

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext()
											  )}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>

					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell, i, cells) => (
										<TableCell
											key={cell.id}
											className={cn(
												"whitespace-nowrap",
												i > 0 && "text-muted-foreground",
												i === cells.length - 1 && "py-0"
											)}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={props.columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
