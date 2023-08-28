import * as React from "react";
import { trpc } from "@admin/src/utils/trpc";
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
	FormProvider,
	Input,
} from "@admin/src/components/ui/client";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { AddFieldDefs, FieldDefs } from "./FieldDefinitons";
import type { ComponentsTableItem } from "../../ComponentsTable";
import { fieldDefinitionUISchema, type FieldDefinitionUI } from "./shared";

const editComponentDefDialogInputsSchema = z.object({
	name: z.string().nonempty({ message: " " }),
	fields: z.array(fieldDefinitionUISchema),
});
type EditComponentDefDialogInputs = z.infer<typeof editComponentDefDialogInputsSchema>;

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
	componentDef: Omit<Extract<ComponentsTableItem, { isGroup: false }>, "isGroup">;
}
export function EditComponentDefDialog(props: Props) {
	const mutation = trpc.components.editComponentDefinition.useMutation();
	const originalFields = props.componentDef.fieldDefinitions;
	const [anyEditing, setAnyEditing] = React.useState(false);

	const form = useForm<EditComponentDefDialogInputs>({
		resolver: zodResolver(editComponentDefDialogInputsSchema),
	});
	const onSubmit: SubmitHandler<EditComponentDefDialogInputs> = (data) => {
		const addedFields = data.fields
			.map((f, i) => ({ ...f, order: i }))
			.filter((f) => f.diffs?.at(-1) === "added");

		const deletedFieldIds = originalFields
			.filter((of) =>
				data.fields.find((f) => f.id === of.id && f.diffs?.at(-1) === "deleted"),
			)
			.map((of) => of.id);

		const editedFields = data.fields
			.map((ef, i) => ({
				...ef,
				// We know for a fact that `editedFields` contains fields that are
				// already in the db, thus having the `id` property for certain
				id: ef.id!,
				order: i,
			}))
			.filter((f, fOrder) =>
				originalFields.find(
					(of) => f.id === of.id && (f.diffs?.at(-1) === "edited" || fOrder !== of.order),
				),
			);

		mutation.mutate(
			{
				id: props.componentDef.id,
				newName: data.name,
				newGroupId: props.componentDef.parentGroupId ?? undefined,
				addedFields,
				deletedFieldIds,
				editedFields,
			},
			{
				onSuccess: () => props.setOpen(false),
			},
		);
	};

	React.useEffect(() => {
		if (props.open) {
			form.reset({
				name: props.componentDef.name,
				fields: originalFields.map(
					(of) =>
						({
							id: of.id,
							name: of.name,
							type: of.type,
							diffs: undefined,
						}) satisfies FieldDefinitionUI,
				),
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.open]);

	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Edit component definition</DialogTitle>
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
											dialogType="edit"
											anyEditing={anyEditing}
											setAnyEditing={setAnyEditing}
											originalFields={originalFields}
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="submit"
								disabled={anyEditing}
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
