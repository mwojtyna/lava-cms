import * as React from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import type { ComponentDefinitionGroup } from "@prisma/client";
import { FolderIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import {
	Button,
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	Input,
} from "@admin/src/components/ui/client";
import { trpc } from "@admin/src/utils/trpc";
import type { ComponentsTableItem } from "../ComponentsTable";

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
}

interface AddGroupDialogProps extends Props {
	group: ComponentDefinitionGroup;
}
interface AddGroupDialogInputs {
	name: string;
}
export function AddGroupDialog(props: AddGroupDialogProps) {
	const mutation = trpc.components.addGroup.useMutation();

	const form = useForm<AddGroupDialogInputs>();
	const onSubmit: SubmitHandler<AddGroupDialogInputs> = (data) => {
		mutation.mutate(
			{
				name: data.name,
				parentId: props.group.id,
			},
			{
				onSuccess: () => {
					props.setOpen(false);
				},
			},
		);
	};

	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent className="!max-w-sm">
				<DialogHeader>
					<DialogTitle>Add group</DialogTitle>
				</DialogHeader>

				<FormProvider {...form}>
					<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="submit"
								loading={mutation.isLoading}
								icon={<FolderIcon className="w-5" />}
							>
								Add
							</Button>
						</DialogFooter>
					</form>
				</FormProvider>
			</DialogContent>
		</Dialog>
	);
}

interface EditGroupDialogProps extends Props {
	item: ComponentsTableItem;
}
interface EditGroupDialogInputs {
	name: string;
}
export function EditGroupDialog(props: EditGroupDialogProps) {
	const mutation = trpc.components.editGroup.useMutation();

	const form = useForm<EditGroupDialogInputs>();
	const onSubmit: SubmitHandler<EditGroupDialogInputs> = (data) => {
		mutation.mutate(
			{
				id: props.item.id,
				newName: data.name,
			},
			{
				onSuccess: () => {
					props.setOpen(false);
				},
			},
		);
	};

	React.useEffect(() => {
		if (props.open) {
			form.setValue("name", props.item.name);
		}
	}, [props.open]);

	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent className="!max-w-sm">
				<DialogHeader>
					<DialogTitle>Edit group</DialogTitle>
				</DialogHeader>

				<FormProvider {...form}>
					<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="submit"
								loading={mutation.isLoading}
								icon={<PencilSquareIcon className="w-5" />}
							>
								Save
							</Button>
						</DialogFooter>
					</form>
				</FormProvider>
			</DialogContent>
		</Dialog>
	);
}
