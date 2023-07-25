"use client";

import * as React from "react";
import { useTable, type TableSearchParams } from "@admin/src/hooks";
import { trpc } from "@admin/src/utils/trpc";
import type { caller } from "@admin/src/trpc/routes/private/_private";
import type { TableCookie } from "@admin/src/utils/cookies";
import { columns } from "./ComponentsTableColumns";
import { DataTable, DataTableBreadcrumbs, DataTablePagination } from "@admin/src/components";

interface Props {
	data: Awaited<ReturnType<typeof caller.components.getGroup>>;
	pagination: TableSearchParams;
	cookie: TableCookie | null;
}

export type ComponentsTableItem = {
	id: string;
	name: string;
	lastUpdated: Date;
	isGroup: boolean;
};

export function ComponentsTable(props: Props) {
	const data = trpc.components.getGroup.useQuery(
		props.data.breadcrumbs.length > 0 ? { id: props.data.group.id } : null,
		{ initialData: props.data },
	).data;

	const tableData: ComponentsTableItem[] = React.useMemo(() => {
		const groups: ComponentsTableItem[] = data.group.groups.map((group) => ({
			id: group.id,
			name: group.name,
			lastUpdated: group.last_update,
			isGroup: true,
		}));
		const components: ComponentsTableItem[] = data.group.component_definitons.map(
			(component) => ({
				id: component.id,
				name: component.name,
				lastUpdated: component.last_update,
				isGroup: false,
			}),
		);

		return [...groups, ...components];
	}, [data]);

	const { table, searchElement } = useTable({
		data: tableData,
		columns: columns,
		cookie: {
			name: "components-table",
			serverContents: props.cookie,
			default: { id: "name", desc: false, pageSize: 10 },
		},
		pagination: {
			pageIndex: props.pagination?.pageIndex ?? 0,
		},
		searchColumn: "name",
	});

	return (
		<div className="flex flex-col gap-4" data-testid="component-definitons-table">
			<div className="flex justify-between gap-2">{searchElement}</div>

			<DataTableBreadcrumbs breadcrumbs={data.breadcrumbs} rootUrl="/dashboard/components" />
			<DataTable table={table} columns={columns} />
			<DataTablePagination table={table} />
		</div>
	);
}
