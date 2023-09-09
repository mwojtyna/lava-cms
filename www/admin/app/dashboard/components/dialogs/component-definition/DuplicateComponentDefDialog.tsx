import * as React from "react";
import { trpc } from "@admin/src/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler, FormProvider } from "react-hook-form";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import {
	DialogHeader,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	Input,
	FormError,
	DialogFooter,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
} from "@admin/src/components/ui/client";
import { AddFieldDefs, FieldDefs } from "./FieldDefinitions";
import {
	addComponentDefDialogInputsSchema,
	type AddComponentDefDialogInputs,
} from "./AddComponentDefDialog";
import type { ComponentsTableItem } from "../../ComponentsTable";

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
	item: Omit<Extract<ComponentsTableItem, { isGroup: false }>, "isGroup">;
}
export function DuplicateComponentDefDialog(props: Props) {
	const mutation = trpc.components.addComponentDefinition.useMutation();
	const [anyEditing, setAnyEditing] = React.useState(false);

	const form = useForm<AddComponentDefDialogInputs>({
		resolver: zodResolver(addComponentDefDialogInputsSchema),
		defaultValues: {
			name: props.item.name,
			fields: props.item.fieldDefinitions.map((field) => ({
				name: field.name,
				type: field.type,
				diffs: [],
			})),
		},
	});
	const onSubmit: SubmitHandler<AddComponentDefDialogInputs> = (data) => {
		mutation.mutate(
			{
				name: data.name,
				fields: data.fields,
				groupId: props.item.parentGroupId!,
			},
			{
				onSuccess: () => props.setOpen(false),
			},
		);
	};

	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Duplicate component definition</DialogTitle>
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
										<Input {...field} aria-required />
									</FormControl>
									<FormError />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="fields"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Fields</FormLabel>
									<FormControl>
										<AddFieldDefs anyEditing={anyEditing} {...field} />
									</FormControl>
									<FormError />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="fields"
							render={({ field }) => (
								<FormItem className="max-h-[50vh] overflow-auto">
									<FormControl>
										<FieldDefs
											dialogType="add"
											anyEditing={anyEditing}
											setAnyEditing={setAnyEditing}
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="submit"
								loading={mutation.isLoading}
								icon={<DocumentDuplicateIcon className="w-5" />}
							>
								Duplicate
							</Button>
						</DialogFooter>
					</form>
				</FormProvider>
			</DialogContent>
		</Dialog>
	);
}
