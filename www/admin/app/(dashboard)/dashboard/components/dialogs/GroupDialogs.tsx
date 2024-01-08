import type { ComponentsTableGroup } from "../ComponentsTable";
import type { ComponentDefinitionGroup } from "@prisma/client";
import { FolderIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import {
	Button,
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	FormControl,
	FormError,
	FormField,
	FormItem,
	FormLabel,
	Input,
} from "@/src/components/ui/client";
import { trpc } from "@/src/utils/trpc";

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
}

const addGroupDialogSchema = z.object({
	name: z.string().min(1, { message: " " }),
});
type AddGroupDialogInputs = z.infer<typeof addGroupDialogSchema>;

interface AddGroupDialogProps extends Props {
	group: ComponentDefinitionGroup;
}
export function AddGroupDialog(props: AddGroupDialogProps) {
	const mutation = trpc.components.addGroup.useMutation();

	const form = useForm<AddGroupDialogInputs>({
		resolver: zodResolver(addGroupDialogSchema),
	});
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
			<DialogContent>
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
									<FormError />
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

const editGroupDialogSchema = z.object({
	name: z.string().min(1, { message: " " }),
});
type EditGroupDialogInputs = z.infer<typeof editGroupDialogSchema>;

interface EditGroupDialogProps extends Props {
	group: ComponentsTableGroup;
}
export function EditGroupDialog(props: EditGroupDialogProps) {
	const mutation = trpc.components.editGroup.useMutation();

	const form = useForm<EditGroupDialogInputs>({
		resolver: zodResolver(editGroupDialogSchema),
	});
	const onSubmit: SubmitHandler<EditGroupDialogInputs> = (data) => {
		mutation.mutate(
			{
				id: props.group.id,
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
			form.setValue("name", props.group.name);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.open]);

	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit &quot;{props.group.name}&quot;</DialogTitle>
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
								Edit
							</Button>
						</DialogFooter>
					</form>
				</FormProvider>
			</DialogContent>
		</Dialog>
	);
}
