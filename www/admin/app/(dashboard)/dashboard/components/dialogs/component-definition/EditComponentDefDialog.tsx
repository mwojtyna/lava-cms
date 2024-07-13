"use client";

import type { FieldDefinitionUI, Step } from "./types";
import type { ComponentsTableComponentDef } from "../../ComponentsTable";
import type { inferRouterInputs } from "@trpc/server";
import { ExclamationTriangleIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHotkeys, useOs, useWindowEvent } from "@mantine/hooks";
import * as React from "react";
import { useForm, type SubmitHandler, FormProvider } from "react-hook-form";
import { Button } from "@/src/components/ui/client/Button";
import { Sheet, SheetContent, SheetFooter } from "@/src/components/ui/client/Sheet";
import { TypographyMuted } from "@/src/components/ui/server/typography";
import { useComponentsTableDialogsStore } from "@/src/stores/componentDefinitions";
import { useAlertDialog } from "@/src/hooks/useAlertDialog";
import { toast } from "@/src/hooks/useToast";
import type { PrivateRouter } from "@/src/trpc/routes/private/_private";
import type { EditComponentDefinitionErrorMessage } from "@/src/trpc/routes/private/components/editComponentDefinition";
import { cn } from "@/src/utils/styling";
import { trpc } from "@/src/utils/trpc";
import {
	ComponentDefEditor,
	componentDefEditorInputsSchema,
	type ComponentDefEditorInputs,
} from "./ComponentDefEditor";
import { FieldDefEditor } from "./FieldDefEditor";
import { ComponentDefinitionNameError } from "./shared";

function isEdited(field: FieldDefinitionUI) {
	return field.diff === "edited" || (field.reordered && field.diff === "none");
}

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
	componentDef: ComponentsTableComponentDef;
}
export function EditComponentDefDialog(props: Props) {
	const [steps, setSteps] = React.useState<Step[]>([
		{
			name: "component-definition",
			componentDef: props.componentDef,
		},
	]);

	const { setItem, fields, originalFields, fieldsDirty, typeChanged, setTypeChanged } =
		useComponentsTableDialogsStore((state) => ({
			setItem: state.setItem,
			fields: state.fields,
			originalFields: state.originalFields,
			fieldsDirty: state.fieldsDirty,
			typeChanged: state.typeChanged,
			setTypeChanged: state.setTypeChanged,
		}));
	const editMutation = trpc.components.editComponentDefinition.useMutation();

	const form = useForm<ComponentDefEditorInputs>({
		resolver: zodResolver(componentDefEditorInputsSchema),
		mode: "onChange",
	});
	const onSubmit: SubmitHandler<ComponentDefEditorInputs> = (data) => {
		type Inputs = inferRouterInputs<PrivateRouter>["components"]["editComponentDefinition"];
		type AddedField = NonNullable<Inputs["addedFields"]>[number];
		type EditedField = NonNullable<Inputs["editedFields"]>[number];

		const correctedFields: FieldDefinitionUI[] = fields
			.filter((f) => f.diff !== "deleted")
			.map((f, i) => {
				const original = originalFields.find((of) => f.id === of.id);
				return {
					...f,
					order: i,
					reordered: original ? i !== original.order : f.reordered,
				};
			});

		const addedFields: AddedField[] = correctedFields
			.map(
				(f) =>
					({
						...f,
						arrayItemType: f.arrayItemType,
					}) satisfies AddedField,
			)
			.filter((f) => f.diff === "added");

		const editedFields: EditedField[] = correctedFields
			.map(
				(ef) =>
					({
						...ef,
						id: ef.id,
						original: originalFields.find((of) => ef.id === of.id)!,
					}) satisfies EditedField,
			)
			// Filter after, otherwise order is wrong
			.filter((f) => isEdited(f));

		const deletedFieldIds: string[] = fields
			.filter((f) => f.diff === "deleted")
			.map((f) => f.id);

		if (typeChanged) {
			alertDialog.open(
				{
					title: "Warning!",
					description:
						"Changing the type of a field will clear its value across all instances. Are you sure you want to continue?",
					yesMessage: "I'm sure",
					noMessage: "Cancel",
					icon: <ExclamationTriangleIcon className="w-6 text-destructive-foreground" />,
				},
				mutate,
			);
		} else {
			mutate();
		}

		function mutate() {
			editMutation.mutate(
				{
					id: props.componentDef.id,
					newName: data.name,
					addedFields,
					editedFields,
					deletedFieldIds,
				},
				{
					// `fidToBid` is a map of frontend ids to backend ids
					onSuccess: ({ fieldDefFidToBid: fidToBid, updatedCompDef }) => {
						setSteps((steps) =>
							steps.map((step) =>
								step.name === "field-definition"
									? {
											...step,
											fieldDef: {
												...step.fieldDef,
												id: fidToBid[step.fieldDef.id] ?? step.fieldDef.id,
											},
										}
									: step,
							),
						);

						setItem({
							id: updatedCompDef.id,
							name: updatedCompDef.name,
							instances: props.componentDef.instances,
							fieldDefinitions: updatedCompDef.field_definitions,
							lastUpdate: updatedCompDef.last_update,
							parentGroupId: updatedCompDef.group_id,
							isGroup: false,
						});
						form.reset(form.getValues());

						toast({
							title: "Success",
							description: "Component definition updated.",
						});
						setTypeChanged(false);
					},
					// Can't extract the whole handler to a shared function
					// because the type of `err` is impossible to specify
					onError: (err) => {
						if (err.data?.code === "CONFLICT") {
							const group = JSON.parse(
								err.message,
							) as EditComponentDefinitionErrorMessage;

							form.setError("name", {
								type: "manual",
								message: (
									<ComponentDefinitionNameError name={data.name} group={group} />
								) as unknown as string,
							});
						}
					},
				},
			);
		}
	};

	const anyDirty = form.formState.isDirty || fieldsDirty;
	const canSubmit = props.open && form.formState.isValid && anyDirty;
	const alertDialog = useAlertDialog();

	// Reset when dialog is opened
	React.useEffect(() => {
		if (props.open) {
			form.reset({ name: props.componentDef.name });
			setSteps([
				{
					name: "component-definition",
					componentDef: props.componentDef,
				},
			]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.open]);
	useHotkeys(
		[
			[
				"mod+s",
				() => {
					if (canSubmit) {
						void form.handleSubmit(onSubmit)();
					}
				},
			],
		],
		[],
	);
	useWindowEvent("beforeunload", (e) => {
		if (props.open && canSubmit) {
			// Display a confirmation dialog
			e.preventDefault();
		}
	});
	const os = useOs();

	function handleSetOpen(value: boolean) {
		if (!anyDirty) {
			props.setOpen(value);
		} else {
			alertDialog.open(
				{
					title: "Discard changes?",
					description: "Are you sure you want to discard your changes?",
					yesMessage: "Discard",
					noMessage: "Cancel",
				},
				() => props.setOpen(false),
			);
		}
	}

	function displayStep(step: Step) {
		switch (step.name) {
			case "component-definition": {
				return (
					<ComponentDefEditor
						step={step}
						setSteps={setSteps}
						open={props.open}
						setOpen={handleSetOpen}
						onSubmit={() => props.setOpen(false)}
						dialogType="edit"
						title={`Edit "${step.componentDef.name}"`}
					/>
				);
			}
			case "field-definition": {
				return <FieldDefEditor step={step} setSteps={setSteps} dialogType="edit" />;
			}
		}
	}

	return (
		<Sheet open={props.open} onOpenChange={handleSetOpen}>
			<SheetContent className="w-screen sm:max-w-md">
				<FormProvider {...form}>
					<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
						{steps.map((step, i) => (
							<div
								key={i}
								className={cn(
									"flex flex-col gap-4",
									i < steps.length - 1 && "hidden",
								)}
							>
								{displayStep(step)}
							</div>
						))}

						<SheetFooter className="items-center gap-2">
							{os !== "android" && os !== "ios" && (
								<TypographyMuted>
									{os === "macos" ? "Cmd" : "Ctrl"}+S
								</TypographyMuted>
							)}
							<Button
								className="max-sm:w-full"
								type="submit"
								loading={editMutation.isLoading}
								disabled={!canSubmit}
								icon={<PencilSquareIcon className="w-5" />}
							>
								Save
							</Button>
						</SheetFooter>
					</form>
				</FormProvider>
			</SheetContent>
		</Sheet>
	);
}
