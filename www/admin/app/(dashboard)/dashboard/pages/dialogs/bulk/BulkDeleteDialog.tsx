import type { BulkEditDialogProps } from "../types";
import { TrashIcon } from "@heroicons/react/24/outline";
import React from "react";
import { AlertDialog } from "@/src/components/AlertDialog";
import { trpc } from "@/src/utils/trpc";

export function BulkDeleteDialog(props: BulkEditDialogProps) {
	const mutation = trpc.pages.deletePage.useMutation();
	const [loading, setLoading] = React.useState(false);
	// const [preferences, setPreferences] = usePagePreferences(props.pages[0].id);

	async function handleSubmit() {
		const promises = props.pages.map((page) =>
			mutation.mutateAsync({
				id: page.id,
			}),
		);
		setLoading(true);
		await Promise.all(promises);
		setLoading(false);
		// setPreferences({ ...preferences, [props.pages[0].id]: undefined });

		props.setOpen(false);
		props.onSubmit();
	}

	return (
		<AlertDialog
			open={props.open}
			setOpen={props.setOpen}
			loading={loading}
			icon={<TrashIcon className="w-5" />}
			title={`Delete ${props.pages.length} items?`}
			description={`Are you sure you want to delete ${props.pages.length} items? This action cannot be undone!`}
			noMessage="No, don't delete"
			yesMessage="Delete"
			onSubmit={handleSubmit}
		/>
	);
}
