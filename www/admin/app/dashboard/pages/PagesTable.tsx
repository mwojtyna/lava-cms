"use client";

import * as React from "react";
import {
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type PaginationState,
	getCoreRowModel,
	useReactTable,
	getFilteredRowModel,
	getSortedRowModel,
	getPaginationRowModel,
	flexRender,
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
import { AddDialog } from "./dialogs";
import { DataTablePagination } from "@admin/src/components";
import { useSearchParams } from "@admin/src/hooks/useSearchParams";
import type { SearchParams } from "./page";

interface PagesTableProps {
	columns: ColumnDef<Page>[];
	group: Page;
	data: { pages: Page[]; breadcrumbs: Page[] };
	searchParams: SearchParams;
}

export function PagesTable(props: PagesTableProps) {
	const clientData = trpcReact.pages.getGroupContents.useQuery(
		props.data.breadcrumbs.length > 0 ? { id: props.group.id } : null
	).data;
	const data: typeof props.data = clientData ?? props.data;

	// TODO: pass sorting and pagination data from server to default useState value
	// // TODO: set searchParams when pagination change
	// TODO: set cookies when sorting change
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: props.searchParams?.pageIndex ?? 0,
		pageSize: 10,
	});

	const { setSearchParams } = useSearchParams({
		onChanged: (searchParams) => {
			setPagination((pagination) => ({
				...pagination,
				pageIndex: parseInt(searchParams.get("pageIndex") ?? "0"),
			}));
		},
	});
	React.useEffect(() => {
		setSearchParams({
			pageIndex: pagination.pageIndex === 0 ? undefined : pagination.pageIndex,
		} satisfies SearchParams);
	}, [pagination, props.searchParams, setSearchParams]);

	const table = useReactTable({
		data: data.pages,
		columns: props.columns,
		getCoreRowModel: getCoreRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
		autoResetPageIndex: false,
		state: {
			columnFilters,
			sorting,
			pagination,
		},
	});

	const [openAddPage, setOpenAddPage] = React.useState(false);
	const [openAddGroup, setOpenAddGroup] = React.useState(false);

	return (
		<>
			<div className="flex flex-col gap-4">
				<div className="flex justify-between gap-2">
					<Input
						className="mr-auto max-w-xs"
						value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
						onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
						icon={<MagnifyingGlassIcon className="w-4" />}
					/>

					<div className="flex gap-2">
						<Button
							onClick={() => setOpenAddPage(true)}
							icon={<DocumentPlusIcon className="w-5" />}
						>
							Page
						</Button>
						<Button
							onClick={() => setOpenAddGroup(true)}
							variant={"secondary"}
							icon={<FolderPlusIcon className="w-5" />}
						>
							Group
						</Button>
					</div>
				</div>

				{data.breadcrumbs.length > 0 && (
					<Stepper
						steps={[
							<Link key={0} href={"/dashboard/pages"}>
								<ActionIcon className="-mr-2">
									<HomeIcon className="w-5 text-foreground" />
								</ActionIcon>
							</Link>,
							...data.breadcrumbs.map((breadcrumb, i) => (
								<Button
									key={i + 1}
									variant={"link"}
									className={cn(
										"whitespace-nowrap font-normal",
										i < data.breadcrumbs.length - 1 && "text-muted-foreground"
									)}
									asChild
								>
									<Link key={i} href={`/dashboard/pages/${breadcrumb.id}`}>
										{breadcrumb.name}
									</Link>
								</Button>
							)),
						]}
						currentStep={data.breadcrumbs.length}
						separator={<ChevronRightIcon className="w-4" />}
					/>
				)}

				<div className="rounded-md border">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id} className="hover:bg-inherit">
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
				<DataTablePagination table={table} />
			</div>

			<AddDialog
				isGroup={false}
				group={props.group}
				open={openAddPage}
				setOpen={setOpenAddPage}
			/>
			<AddDialog
				isGroup={true}
				group={props.group}
				open={openAddGroup}
				setOpen={setOpenAddGroup}
			/>
		</>
	);
}
