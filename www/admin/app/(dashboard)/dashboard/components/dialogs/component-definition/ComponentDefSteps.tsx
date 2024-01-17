import type { ComponentsTableComponentDef } from "../../ComponentsTable";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useEffect } from "react";
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
	ActionIcon,
} from "@/src/components/ui/client";
import { TypographyMuted } from "@/src/components/ui/server";
import { useComponentsTableDialogs } from "@/src/data/stores/componentDefinitions";
import { useWindowEvent } from "@/src/hooks";
import { trpc } from "@/src/utils/trpc";
import { AddFieldDefs, FieldDefs } from "./FieldDefinitions";
import {
	ComponentDefinitionNameError,
	fieldDefinitionUISchema,
	type FieldDefinitionUI,
	FieldTypePicker,
} from "./shared";

export type DialogType = "add" | "edit";
export type Step =
	| {
			name: "component-definition";
			componentDef: ComponentsTableComponentDef;
	  }
	| {
			name: "field-definition";
			fieldDef: FieldDefinitionUI;
	  };

const componentDefDialogInputsSchema = z.object({
	name: z.string().min(1, { message: " " }),
});
type ComponentDefDialogInputs = z.infer<typeof componentDefDialogInputsSchema>;
interface ComponentDefStepProps {
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
export function ComponentDefStep(props: ComponentDefStepProps) {
	const editMutation = trpc.components.editComponentDefinition.useMutation();
	const addMutation = trpc.components.addComponentDefinition.useMutation();
	const { originalFields, fields, isDirty: fieldsDirty } = useComponentsTableDialogs();

	const form = useForm<ComponentDefDialogInputs>({
		resolver: zodResolver(componentDefDialogInputsSchema),
		mode: "onChange",
	});

	React.useEffect(() => {
		props.setIsDirty(form.formState.isDirty || fieldsDirty);
	}, [fieldsDirty, form.formState.isDirty, props]);
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

	useWindowEvent("keydown", (e) => {
		if ((e.ctrlKey || e.metaKey) && e.key === "s") {
			e.preventDefault();
			if (canSubmit) {
				void form.handleSubmit(onSubmit)();
			}
		}
	});
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
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Name&nbsp;
									<TypographyMuted>(unique)</TypographyMuted>
								</FormLabel>
								<FormControl>
									<Input {...field} aria-required />
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

const fieldDefDialogSchema = fieldDefinitionUISchema.pick({ name: true, type: true });
type Inputs = z.infer<typeof fieldDefDialogSchema>;

interface FieldDefStepProps {
	step: Extract<Step, { name: "field-definition" }>;
	setSteps: React.Dispatch<React.SetStateAction<Step[]>>;

	onSubmit: () => void;
	isDirty: boolean;
	setIsDirty: (value: boolean) => void;

	title: string;
}
export function FieldDefStep(props: FieldDefStepProps) {
	const { fields, setFields } = useComponentsTableDialogs();

	const form = useForm<Inputs>({
		resolver: zodResolver(fieldDefDialogSchema),
		defaultValues: {
			name: props.step.fieldDef.name,
			type: props.step.fieldDef.type,
		},
	});
	const onSubmit: SubmitHandler<Inputs> = useCallback(
		(data) => {
			setFields(
				fields.map((f) =>
					f.id === props.step.fieldDef.id
						? {
								id: f.id,
								// Don't ever move this, order matters when checking for equality with original fields
								...data,
								order: f.order,
								diff: "edited",
						  }
						: f,
				),
			);
		},
		[fields, props.step.fieldDef.id, setFields],
	);

	useEffect(() => {
		// Trigger validation on mount, fixes Ctrl+S after first change not saving
		void form.trigger();

		// TODO: Optimize
		const { unsubscribe } = form.watch(() => {
			// setIsValid(form.formState.isValid);
			if (form.formState.isValid && !form.formState.isValidating) {
				void form.handleSubmit(onSubmit)();
			}
		});

		return unsubscribe;
	}, [form, onSubmit]);

	return (
		<>
			<SheetHeader>
				<SheetTitle className="flex gap-2">
					<ActionIcon
						variant={"simple"}
						onClick={() => props.setSteps((steps) => steps.slice(0, steps.length - 1))}
					>
						<ArrowLeftIcon className="w-6" />
					</ActionIcon>
					Edit &quot;{props.step.fieldDef.name}&quot;
				</SheetTitle>
			</SheetHeader>

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

					<FormField
						control={form.control}
						name="type"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Type</FormLabel>
								<FormControl>
									<FieldTypePicker {...field} />
								</FormControl>
							</FormItem>
						)}
					/>
				</form>
			</FormProvider>
		</>
	);
}
