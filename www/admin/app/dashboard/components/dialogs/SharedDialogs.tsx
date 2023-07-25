import { TrashIcon } from "@heroicons/react/24/outline";
import { trpc } from "@admin/src/utils/trpc";
import type { ComponentsTableItem } from "../ComponentsTable";
import { AlertDialog } from "@admin/src/components";

interface Props {
	item: ComponentsTableItem;
	open: boolean;
	setOpen: (value: boolean) => void;
}

export function DeleteDialog(props: Props) {
	const mutation = props.item.isGroup
		? trpc.components.deleteGroup.useMutation()
		: trpc.components.deleteComponentDefinition.useMutation();

	async function handleSubmit() {
		await mutation.mutateAsync({ id: props.item.id });
		props.setOpen(false);
	}

	return (
		<AlertDialog
			icon={<TrashIcon className="w-5" />}
			title={`Delete ${props.item.isGroup ? "group" : "component definition"} "${
				props.item.name
			}"?`}
			description={
				props.item.isGroup
					? "Are you sure you want to delete the group and all its component definitions? This action cannot be undone!"
					: "Are you sure you want to delete the component definition? This action cannot be undone!"
			}
			yesMessage="Delete"
			noMessage="No, don't delete"
			mutation={mutation}
			onSubmit={handleSubmit}
			open={props.open}
			setOpen={props.setOpen}
		/>
	);
}
