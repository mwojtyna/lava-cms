import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm, type SubmitHandler, FormProvider } from "react-hook-form";
import { z } from "zod";
import {
	SheetHeader,
	SheetTitle,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	Input,
	FormError,
	SheetFooter,
	Button,
	getRestorableInputProps,
} from "@/src/components/ui/client";
import { TypographyMuted } from "@/src/components/ui/server";
import { useComponentsTableDialogs } from "@/src/data/stores/componentDefinitions";
import { useWindowEvent } from "@/src/hooks";
import { trpc } from "@/src/utils/trpc";
import { AddFieldDefs, FieldDefs } from "./FieldDefinitions";
import { ComponentDefinitionNameError, type DialogType, type Step } from "./shared";

const componentDefDialogInputsSchema = z.object({
	name: z.string().min(1, { message: " " }),
});
type ComponentDefDialogInputs = z.infer<typeof componentDefDialogInputsSchema>;
interface ComponentDefEditorProps {
	step: Extract<Step, { name: "component-definition" }>;
	setSteps: React.Dispatch<React.SetStateAction<Step[]>>;

	open: boolean;
	setOpen: (value: boolean) => void;
	onSubmit: () => void;

	isDirty: boolean;
	setIsDirty: (value: boolean) => void;

	dialogType: DialogType;
	title: string;
	submitButton: {
		text: string;
		icon: React.ReactNode;
	};
}
export function ComponentDefEditor(props: ComponentDefEditorProps) {
	const editMutation = trpc.components.editComponentDefinition.useMutation();
	const addMutation = trpc.components.addComponentDefinition.useMutation();
	const { originalFields, fields } = useComponentsTableDialogs();

	const form = useForm<ComponentDefDialogInputs>({
		resolver: zodResolver(componentDefDialogInputsSchema),
		mode: "onChange",
	});

	React.useEffect(() => {
		props.setIsDirty(form.formState.isDirty);
	}, [form.formState.isDirty, props]);
	const canSubmit = form.formState.isValid && props.dialogType === "edit" ? props.isDirty : true;

	const onSubmit: SubmitHandler<ComponentDefDialogInputs> = (data) => {
		const addedFields = fields
			.map((f, i) => ({ ...f, order: i }))
			.filter((f) => f.diff === "added");

		const deletedFieldIds = fields.filter((f) => f.diff === "deleted").map((f) => f.id);

		const editedFields = fields
			.map((ef, i) => ({
				...ef,
				id: ef.id,
				order: i,
			}))
			.filter((f) =>
				originalFields.find(
					(of) => f.id === of.id && (f.diff === "edited" || f.diff === "reordered"),
				),
			);

		if (props.dialogType === "edit") {
			editMutation.mutate(
				{
					id: props.step.componentDef.id,
					newName: data.name,
					newGroupId: props.step.componentDef.parentGroupId!,
					addedFields,
					deletedFieldIds,
					editedFields,
				},
				{
					onSuccess: props.onSubmit,
					// Can't extract the whole handler to a shared function
					// because the type of `err` is impossible to specify
					onError: (err) => {
						if (err.data?.code === "CONFLICT") {
							const group = JSON.parse(err.message) as {
								name: string;
								id: string;
							};

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
		} else if (props.dialogType === "add") {
			addMutation.mutate(
				{
					name: data.name,
					groupId: props.step.componentDef.parentGroupId!,
					fields: fields.map((f, i) => ({ ...f, order: i })),
				},
				{
					onSuccess: props.onSubmit,
					// Can't extract the whole handler to a shared function
					// because the type of `err` is impossible to specify
					onError: (err) => {
						if (err.data?.code === "CONFLICT") {
							const group = JSON.parse(err.message) as {
								name: string;
								id: string;
							};

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

	React.useEffect(() => {
		if (props.open) {
			form.reset({ name: props.step.componentDef.name });
		}
	}, [form, props.open, props.step.componentDef.name]);

	useWindowEvent("beforeunload", (e) => {
		if (props.open && canSubmit) {
			// Display a confirmation dialog
			e.preventDefault();
		}
	});

	return (
		<>
			<SheetHeader>
				<SheetTitle>{props.title}</SheetTitle>
			</SheetHeader>

			<FormProvider {...form}>
				<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
					<FormField
						control={form.control}
						name="name"
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel>
									Name&nbsp;
									<TypographyMuted>(unique)</TypographyMuted>
								</FormLabel>
								<FormControl>
									<Input
										{...field}
										{...(props.dialogType === "edit" &&
											getRestorableInputProps(fieldState.isDirty, () =>
												form.resetField("name"),
											))}
										aria-required
									/>
								</FormControl>
								<FormError />
							</FormItem>
						)}
					/>
					<FormItem>
						<FormLabel>Fields</FormLabel>
						<AddFieldDefs />
					</FormItem>

					<FieldDefs
						dialogType={props.dialogType}
						onFieldClick={(field) =>
							props.setSteps((steps) => [
								...steps,
								{ name: "field-definition", fieldDef: field },
							])
						}
					/>

					<SheetFooter>
						<Button
							type="submit"
							loading={editMutation.isLoading || addMutation.isLoading}
							disabled={!canSubmit}
							icon={props.submitButton.icon}
						>
							{props.submitButton.text}
						</Button>
					</SheetFooter>
				</form>
			</FormProvider>
		</>
	);
}
