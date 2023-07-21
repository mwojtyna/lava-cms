import * as React from "react";
import type {
	ColumnFiltersState,
	PaginationState,
	SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { setCookie } from "cookies-next";
import type { SearchParams } from "@admin/app/dashboard/pages/page";
import {
	getJsonCookie,
	permanentCookieOptions,
	type CookieName,
	type TableCookie,
} from "@admin/src/utils/cookies";
import { useSearchParams } from "./useSearchParams";

interface UseTableCookieOptions {
	cookie: {
		name: CookieName;
		contents: TableCookie | null;
		default: TableCookie;
	};
	pagination: SearchParams;
}

export function useTableCookie(options: UseTableCookieOptions) {
	const parsedCookie = React.useMemo(
		() =>
			getJsonCookie<TableCookie>(
				options.cookie.name,
				options.cookie.contents ?? options.cookie.default,
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
				pageIndex: parseInt(searchParams.get("pageIndex") ?? "0"),
			}));
		},
	});

	React.useEffect(() => {
		setSearchParams({
			pageIndex: pagination.pageIndex === 0 ? undefined : pagination.pageIndex,
		} satisfies SearchParams);
	}, [pagination.pageIndex, setSearchParams]);
	React.useEffect(() => {
		setCookie(
			options.cookie.name,
			JSON.stringify({ ...sorting[0], pageSize: pagination.pageSize } as TableCookie),
			permanentCookieOptions,
		);
	}, [options.cookie, pagination, sorting]);

	const reactTableProps = {
		onColumnFiltersChange: setColumnFilters,
		onSortingChange: (value) => {
			setSorting(value);
			setCookie(
				options.cookie.name,
				// @ts-expect-error `value` type is weird
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				JSON.stringify({ ...value()[0], pageSize: pagination.pageSize } as TableCookie),
				permanentCookieOptions,
			);
		},
		onPaginationChange: setPagination,
		state: {
			columnFilters,
			sorting,
			pagination,
		},
	} satisfies Partial<Parameters<typeof useReactTable>[0]>;

	return reactTableProps;
}
