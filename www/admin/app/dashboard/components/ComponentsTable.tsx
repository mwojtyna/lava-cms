"use client";

import * as React from "react";
import { useTable, type TableSearchParams } from "@admin/src/hooks";
import { trpc } from "@admin/src/utils/trpc";
import type { caller } from "@admin/src/trpc/routes/private/_private";
import type { TableCookie } from "@admin/src/utils/cookies";
import { columns } from "./ComponentsTableColumns";
import {
	DataTable,
	DataTableActions,
	DataTableBreadcrumbs,
	DataTablePagination,
} from "@admin/src/components";
import { CubeIcon } from "@heroicons/react/24/outline";
import { AddGroupDialog } from "./dialogs/GroupDialogs";

interface Props {
	data: Awaited<ReturnType<typeof caller.components.getGroup>>;
	pagination: TableSearchParams;
	cookie: TableCookie | null;
}

export type ComponentsTableItem = {
	id: string;
	name: string;
	lastUpdate: Date;
} & (
	| {
			isGroup: false;
			instances: Props["data"]["group"]["component_definitions"][number]["components"];
	  }
	| {
			isGroup: true;
	  }
);

export function ComponentsTable(props: Props) {
	const data = trpc.components.getGroup.useQuery(
		props.data.breadcrumbs.length > 0 ? { id: props.data.group.id } : null,
		{ initialData: props.data },
	).data;

	const tableData: ComponentsTableItem[] = React.useMemo(() => {
		const groups: ComponentsTableItem[] = data.group.groups.map((group) => ({
			id: group.id,
			name: group.name,
			lastUpdate: group.last_update,
			isGroup: true,
		}));
		const componentDefinitions: ComponentsTableItem[] = data.group.component_definitions.map(
			(component, i) => ({
				id: component.id,
				name: component.name,
				lastUpdate: component.last_update,
				isGroup: false,
				instances: data.group.component_definitions[i]!.components,
			}),
		);

		return [...groups, ...componentDefinitions];
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

	const [openAddGroup, setOpenAddGroup] = React.useState(false);

	return (
		<>
			<div className="flex flex-col gap-4" data-testid="component-definitions-table">
				<DataTableActions
					searchElement={searchElement}
					itemName="component"
					itemIcon={<CubeIcon className="w-5" />}
					// addItem={() => setOpenAddPage(true)}
					onAddGroup={() => setOpenAddGroup(true)}
				/>

				<DataTableBreadcrumbs
					breadcrumbs={data.breadcrumbs}
					rootUrl="/dashboard/components"
				/>
				<DataTable table={table} columns={columns} />
				<DataTablePagination table={table} />
			</div>

			<AddGroupDialog
				group={props.data.group}
				open={openAddGroup}
				setOpen={setOpenAddGroup}
			/>
		</>
	);
}
