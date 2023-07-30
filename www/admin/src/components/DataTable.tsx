"use client";

import Link from "next/link";
import {
	flexRender,
	type ColumnDef,
	type Table as TableType,
	type Column,
} from "@tanstack/react-table";
import {
	HomeIcon,
	ChevronRightIcon,
	ChevronDoubleLeftIcon,
	ChevronDoubleRightIcon,
	ChevronLeftIcon,
	FolderIcon,
} from "@heroicons/react/24/outline";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
	Stepper,
} from "./ui/server";
import { cn } from "../utils/styling";
import {
	ActionIcon,
	Button,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/client";
import { ChevronDownIcon, ChevronUpDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";

export const dateFormatOptions: Intl.DateTimeFormatOptions = {
	year: "numeric",
	month: "long",
	day: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
	hour12: false,
};

interface Props<T> {
	table: TableType<T>;
	columns: ColumnDef<T>[];
}
export function DataTable<T>(props: Props<T>) {
	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					{props.table.getHeaderGroups().map((headerGroup) => (
						<TableRow
							key={headerGroup.id}
							className="whitespace-nowrap hover:bg-inherit"
						>
							{headerGroup.headers.map((header) => (
								<TableHead
									key={header.id}
									style={{ width: header.getSize().toString() + "px" }}
								>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
										  )}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>

				<TableBody>
					{props.table.getRowModel().rows?.length ? (
						props.table.getRowModel().rows.map((row) => (
							<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
								{row.getVisibleCells().map((cell, i, cells) => (
									<TableCell
										key={cell.id}
										className={cn(
											"whitespace-nowrap",
											i > 0 && "text-muted-foreground",
											i === cells.length - 1 && "py-0",
										)}
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={props.columns.length} className="h-24 text-center">
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}

export interface Breadcrumb {
	id: string;
	name: string;
}
export function DataTableBreadcrumbs<T extends Breadcrumb>({
	breadcrumbs,
	rootUrl,
}: {
	breadcrumbs: T[];
	rootUrl: string;
}) {
	return (
		<>
			{breadcrumbs.length > 0 && (
				<Stepper
					className="-mb-2"
					steps={[
						<Link key={0} href={rootUrl}>
							<ActionIcon className="-mr-2">
								<HomeIcon className="w-5 text-foreground" />
							</ActionIcon>
						</Link>,
						...breadcrumbs.map((breadcrumb, i) => (
							<Button
								key={i + 1}
								variant={"link"}
								className={cn(
									"whitespace-nowrap font-normal",
									i < breadcrumbs.length - 1 && "text-muted-foreground",
								)}
								asChild
							>
								<Link key={i} href={`${rootUrl}/${breadcrumb.id}`}>
									{breadcrumb.name}
								</Link>
							</Button>
						)),
					]}
					currentStep={breadcrumbs.length}
					separator={<ChevronRightIcon className="w-4" />}
					data-testid="breadcrumbs"
				/>
			)}
		</>
	);
}

export function DataTablePagination<TData>({ table }: { table: TableType<TData> }) {
	return (
		<div className="ml-auto flex flex-wrap items-center justify-between">
			<div className="flex items-center gap-6">
				<div className="flex items-center space-x-2">
					<p className="text-sm font-medium">Rows per page</p>
					<Select
						value={table.getState().pagination.pageSize.toString()}
						onValueChange={(value) => {
							table.setPageSize(Number(value));
						}}
					>
						<SelectTrigger className="h-8 w-[70px]">
							<SelectValue placeholder={table.getState().pagination.pageSize} />
						</SelectTrigger>
						<SelectContent side="top">
							{[10, 20, 30, 40, 50].map((pageSize) => (
								<SelectItem key={pageSize} value={`${pageSize}`}>
									{pageSize}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex w-[100px] items-center justify-center text-sm font-medium">
					Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
				</div>

				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
					>
						<span className="sr-only">Go to first page</span>
						<ChevronDoubleLeftIcon className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="h-8 w-8 p-0"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<span className="sr-only">Go to previous page</span>
						<ChevronLeftIcon className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="h-8 w-8 p-0"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						<span className="sr-only">Go to next page</span>
						<ChevronRightIcon className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}
					>
						<span className="sr-only">Go to last page</span>
						<ChevronDoubleRightIcon className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}

export function DataTableSortableHeader<T>({
	column,
	name,
}: {
	column: Column<T, unknown>;
	name: string;
}) {
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

interface DataTableActionsProps {
	searchElement: React.ReactNode;
	itemName: string;
	itemIcon: React.ReactNode;
	onAddItem: () => void;
	onAddGroup: () => void;
}
export function DataTableActions(props: DataTableActionsProps) {
	return (
		<div className="flex justify-between gap-2">
			{props.searchElement}

			<div className="flex gap-2">
				<Button onClick={props.onAddItem} icon={props.itemIcon} data-testid="add-item">
					Add {props.itemName}
				</Button>
				<Button
					onClick={props.onAddGroup}
					variant={"secondary"}
					icon={<FolderIcon className="w-5" />}
					data-testid="add-group"
				>
					Add group
				</Button>
			</div>
		</div>
	);
}
