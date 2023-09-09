import * as React from "react";
import { trpc } from "@admin/src/utils/trpc";
import type { ComponentsTableItem } from "../ComponentsTable";
import { AlertDialog } from "@admin/src/components";
import { TrashIcon } from "@heroicons/react/24/outline";

interface Props {
	items: ComponentsTableItem[];
	open: boolean;
	setOpen: (open: boolean) => void;
	onSubmit: () => void;
}

export function BulkDeleteDialog(props: Props) {
	const componentDefMutation = trpc.components.deleteComponentDefinition.useMutation();
	const groupMutation = trpc.components.deleteGroup.useMutation();
	const [loading, setLoading] = React.useState(false);

	async function handleSubmit() {
		const promises = props.items.map((item) =>
			item.isGroup
				? groupMutation.mutateAsync({ id: item.id })
				: componentDefMutation.mutateAsync({ id: item.id }),
		);
		setLoading(true);
		await Promise.all(promises);
		setLoading(false);

		props.setOpen(false);
		props.onSubmit();
	}

	return (
		<AlertDialog
			open={props.open}
			setOpen={props.setOpen}
			loading={loading}
			icon={<TrashIcon className="w-5" />}
			title={`Delete ${props.items.length} items?`}
			description={`Are you sure you want to delete ${props.items.length} items? This action cannot be undone!`}
			noMessage="No, don't delete"
			yesMessage="Delete"
			onSubmit={handleSubmit}
		/>
	);
}
