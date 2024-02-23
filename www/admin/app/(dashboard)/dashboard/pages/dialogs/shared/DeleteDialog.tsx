import type { EditDialogProps } from "../types";
import { TrashIcon } from "@heroicons/react/24/outline";
import { AlertDialog } from "@/src/components/AlertDialog";
import { usePagePreferences } from "@/src/hooks/usePagePreferences";
import { trpc } from "@/src/utils/trpc";

export function DeleteDialog(props: EditDialogProps) {
	const mutation = trpc.pages.deletePage.useMutation();
	const [preferences, setPreferences] = usePagePreferences(props.page.id);

	async function handleSubmit() {
		await mutation.mutateAsync({
			id: props.page.id,
		});
		setPreferences({ ...preferences, [props.page.id]: undefined });
		props.setOpen(false);
	}

	return (
		<AlertDialog
			open={props.open}
			setOpen={props.setOpen}
			loading={mutation.isLoading}
			icon={<TrashIcon className="w-5" />}
			title={`Delete ${props.page.is_group ? "group" : "page"} "${props.page.name}"?`}
			description={
				props.page.is_group
					? "Are you sure you want to delete the group and all its pages? This action cannot be undone!"
					: "Are you sure you want to delete the page? This action cannot be undone!"
			}
			noMessage="No, don't delete"
			yesMessage="Delete"
			onSubmit={handleSubmit}
		/>
	);
}
