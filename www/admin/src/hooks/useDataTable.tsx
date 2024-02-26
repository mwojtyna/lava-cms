import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type ColumnFiltersState,
	type PaginationState,
	type SortingState,
	useReactTable,
	type ColumnDef,
	functionalUpdate,
} from "@tanstack/react-table";
import Cookies from "js-cookie";
import * as React from "react";
import {
	getJsonCookie,
	permanentCookieOptions,
	type CookieName,
	type TableCookie,
} from "@/src/utils/cookies";
import { Input } from "../components/ui/client/Input";
import { useSearchParams } from "./useSearchParams";
import "client-only";

export type TableSearchParams =
	| {
			pageIndex?: number;
	  }
	| undefined;

interface Options<T> {
	data: T[];
	columns: ColumnDef<T>[];
	cookie: {
		name: CookieName;
		serverContents: TableCookie | null;
		default: TableCookie;
	};
	pagination: TableSearchParams;
	searchColumn: string;
}

/** A hook that provides data for a table with sorting, filtering, and pagination, all saved to a cookie. **/
export function useDataTable<T>(options: Options<T>) {
	const parsedCookie = React.useMemo(
		() =>
			getJsonCookie<TableCookie>(
				options.cookie.name,
				options.cookie.serverContents ?? options.cookie.default,
			),
		[options.cookie],
	);

	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [sorting, setSorting] = React.useState<SortingState>(() => [
		{ id: parsedCookie.id, desc: parsedCookie.desc },
	]);

	const [pagination, setPagination] = React.useState<PaginationState>(() => ({
		pageIndex: options.pagination?.pageIndex ?? 0,
		pageSize: parsedCookie.pageSize ?? 10,
	}));
	const { setSearchParams } = useSearchParams({
		onChanged: (searchParams) => {
			setPagination((pagination) => ({
				...pagination,
				pageIndex: Number(searchParams.get("pageIndex") ?? "0"),
			}));
		},
	});

	const table = useReactTable({
		data: options.data,
		columns: options.columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		autoResetPageIndex: false,
		onColumnFiltersChange: setColumnFilters,
		onSortingChange: (updater) => {
			const newSorting = functionalUpdate(updater, sorting);
			setSorting(newSorting);
			Cookies.set(
				options.cookie.name,
				JSON.stringify({ pageSize: pagination.pageSize, ...newSorting[0] } as TableCookie),
				permanentCookieOptions,
			);
		},
		onPaginationChange: (updater) => {
			const newPagination = functionalUpdate(updater, pagination);
			setPagination(newPagination);
			setSearchParams({
				pageIndex: newPagination.pageIndex === 0 ? undefined : newPagination.pageIndex,
			} satisfies TableSearchParams);
			Cookies.set(
				options.cookie.name,
				JSON.stringify({ ...sorting[0], pageSize: newPagination.pageSize } as TableCookie),
				permanentCookieOptions,
			);
		},
		state: {
			columnFilters,
			sorting,
			pagination,
		},
	});

	const searchElement = (
		<Input
			type="search"
			className="mr-auto w-auto min-w-[8rem]"
			value={(table.getColumn(options.searchColumn)?.getFilterValue() as string) ?? ""}
			onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
			icon={<MagnifyingGlassIcon className="w-4" />}
		/>
	);

	return {
		table,
		searchElement,
	};
}
