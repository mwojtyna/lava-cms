"use client";

import * as React from "react";
import { FolderArrowDownIcon, TrashIcon } from "@heroicons/react/24/outline";
import { trpc } from "@admin/src/utils/trpc";
import type { ComponentsTableItem } from "../ComponentsTable";
import { AlertDialog, type MoveDialogInputs, NewParentSelect } from "@admin/src/components";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
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
} from "@admin/src/components/ui/client";
import { groupsToComboboxEntries } from "./component-definition/shared";

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
			loading={mutation.isLoading}
			onSubmit={handleSubmit}
			open={props.open}
			setOpen={props.setOpen}
		/>
	);
}

export function MoveDialog(props: Props) {
	const mutation = props.item.isGroup
		? trpc.components.editGroup.useMutation()
		: trpc.components.editComponentDefinition.useMutation();

	const allGroups = trpc.components.getAllGroups.useQuery(undefined, {
		enabled: props.open,
	}).data;
	const groups = React.useMemo(
		() =>
			groupsToComboboxEntries(
				allGroups?.filter(
					(group) =>
						!group.hierarchy.includes(props.item.id) &&
						group.id !== props.item.id &&
						group.id !== props.item.parentGroupId,
				) ?? [],
			),
		[allGroups, props.item],
	);

	const form = useForm<MoveDialogInputs>();
	const onSubmit: SubmitHandler<MoveDialogInputs> = async (data) => {
		await mutation.mutateAsync({
			id: props.item.id,
			newGroupId: data.newParentId,
		});
		props.setOpen(false);
	};

	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						Move {props.item.isGroup ? "group" : "component definition"} &quot;
						{props.item.name}&quot;
					</DialogTitle>
				</DialogHeader>

				<FormProvider {...form}>
					<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="newParentId"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<NewParentSelect parents={groups ?? []} {...field} />
									</FormControl>
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="submit"
								disabled={!form.watch("newParentId")}
								loading={mutation.isLoading}
								icon={<FolderArrowDownIcon className="w-5" />}
							>
								Move
							</Button>
						</DialogFooter>
					</form>
				</FormProvider>
			</DialogContent>
		</Dialog>
	);
}
