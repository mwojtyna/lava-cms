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
import type { ComponentsTableComponentDef } from "../../ComponentsTable";
import { TypographyMuted } from "@admin/src/components/ui/server";
import {
	ComponentDefinitionNameError,
	fieldDefinitionUISchema,
	groupsToComboboxEntries,
} from "./shared";
import { z } from "zod";
import { NewParentSelect } from "@admin/src/components";

const duplicateComponentDefDialogInputsSchema = z.object({
	// This is named `compName` instead of `name` because `name` is already used
	// in the `FieldDefinitionUI` type and errors are duplicated.
	// Also it's easier to change this name than the other one
	compName: z.string().min(1, { message: " " }),
	// Omitting id because it's not available when adding a new component definition
	fields: z.array(fieldDefinitionUISchema.omit({ id: true })),
	newParentId: z.string().cuid(),
});
type DuplicateComponentDefDialogInputs = z.infer<typeof duplicateComponentDefDialogInputsSchema>;

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
	componentDef: ComponentsTableComponentDef;
}
export function DuplicateComponentDefDialog(props: Props) {
	const mutation = trpc.components.addComponentDefinition.useMutation();
	const [anyEditing, setAnyEditing] = React.useState(false);

	const allGroups = trpc.components.getAllGroups.useQuery(undefined, {
		enabled: props.open,
	}).data;
	const groups = React.useMemo(() => groupsToComboboxEntries(allGroups ?? []), [allGroups]);

	const form = useForm<DuplicateComponentDefDialogInputs>({
		resolver: zodResolver(duplicateComponentDefDialogInputsSchema),
	});
	const onSubmit: SubmitHandler<DuplicateComponentDefDialogInputs> = (data) => {
		mutation.mutate(
			{
				name: data.compName,
				fields: data.fields,
				groupId: data.newParentId,
			},
			{
				onSuccess: () => props.setOpen(false),
				// Can't extract the whole handler to a shared function
				// because the type of `err` is impossible to specify
				onError: (err) => {
					if (err.data?.code === "CONFLICT") {
						const group = JSON.parse(err.message) as {
							name: string;
							id: string;
						};

						form.setError("compName", {
							type: "manual",
							message: (
								<ComponentDefinitionNameError name={data.compName} group={group} />
							) as unknown as string,
						});
					}
				},
			},
		);
	};

	React.useEffect(() => {
		form.reset({
			compName: props.componentDef.name,
			fields: props.componentDef.fieldDefinitions.map((field) => ({
				name: field.name,
				type: field.type,
				diffs: [],
			})),
			// null -> undefined
			newParentId: props.componentDef.parentGroupId ?? undefined,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.open]);

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
							name="compName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Name&nbsp;<TypographyMuted>(unique)</TypographyMuted>
									</FormLabel>
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

						<FormField
							control={form.control}
							name="newParentId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Group</FormLabel>
									<FormControl>
										<NewParentSelect parents={groups ?? []} {...field} />
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
