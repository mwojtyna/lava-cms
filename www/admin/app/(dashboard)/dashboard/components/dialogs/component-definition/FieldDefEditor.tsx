"use client";

import type { z } from "zod";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useCallback, useEffect } from "react";
import { useForm, type SubmitHandler, FormProvider } from "react-hook-form";
import { getRestorableComboboxProps } from "@/src/components/Combobox";
import { InfoTooltip } from "@/src/components/InfoTooltip";
import { ActionIcon } from "@/src/components/ui/client/ActionIcon";
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormError,
} from "@/src/components/ui/client/Form";
import { Input, getRestorableInputProps } from "@/src/components/ui/client/Input";
import { SheetHeader, SheetTitle } from "@/src/components/ui/client/Sheet";
import { useComponentsTableDialogsStore } from "@/src/data/stores/componentDefinitions";
import { cn } from "@/src/utils/styling";
import { FieldTypePicker } from "./shared";
import { fieldDefinitionUISchema, type DialogType, type Step } from "./types";

const fieldDefDialogSchema = fieldDefinitionUISchema.pick({
	name: true,
	displayName: true,
	type: true,
	arrayItemType: true,
});
type Inputs = z.infer<typeof fieldDefDialogSchema>;

interface FieldDefEditorProps {
	step: Extract<Step, { name: "field-definition" }>;
	setSteps: React.Dispatch<React.SetStateAction<Step[]>>;
	dialogType: DialogType;
}
export function FieldDefEditor(props: FieldDefEditorProps) {
	const { setFields, originalFields, setTypeChanged } = useComponentsTableDialogsStore(
		(state) => ({
			fields: state.fields,
			setFields: state.setFields,
			originalFields: state.originalFields,
			setTypeChanged: state.setTypeChanged,
		}),
	);
	// Can be undefined if the field was just added in an 'add' type dialog
	const originalField = useMemo(
		() => originalFields.find((f) => f.id === props.step.fieldDef.id),
		[originalFields, props.step.fieldDef.id],
	);

	const form = useForm<Inputs>({
		resolver: zodResolver(fieldDefDialogSchema),
		defaultValues: {
			name: props.step.fieldDef.name,
			displayName: props.step.fieldDef.displayName,
			type: props.step.fieldDef.type,
			arrayItemType: props.step.fieldDef.arrayItemType,
		},
	});
	const onSubmit: SubmitHandler<Inputs> = useCallback(
		(data) => {
			// Don't change this `if`, this is exactly how it should work
			if (data.type !== "COLLECTION") {
				// Change this to null for the `setTypeChanged` later
				data.arrayItemType = null;
			} else if (data.type === "COLLECTION" && data.arrayItemType === null) {
				// If the user changes the type to COLLECTION, set initial arrayItemType
				form.setValue("arrayItemType", originalField?.arrayItemType ?? "TEXT");
			}

			// Update step name
			props.setSteps((steps) =>
				steps.map<Step>((step) =>
					step.name === props.step.name
						? {
								...step,
								fieldDef: {
									...step.fieldDef,
									name: data.name,
								},
							}
						: step,
				),
			);
			setFields((fields) =>
				fields.map((f) =>
					f.id === props.step.fieldDef.id
						? {
								// Don't ever move this, order matters when checking for equality with original fields
								id: f.id,
								name: data.name,
								displayName: data.displayName,
								type: data.type,
								arrayItemType:
									data.type === "COLLECTION" ? data.arrayItemType : null,
								order: f.order,
								diff: props.step.fieldDef.diff !== "added" ? "edited" : "added",
								reordered: false,
							}
						: f,
				),
			);

			if (originalField) {
				setTypeChanged(
					data.type !== originalField.type ||
						data.arrayItemType !== originalField.arrayItemType,
				);
			}
		},
		[form, originalField, props, setFields, setTypeChanged],
	);

	useEffect(() => {
		// Trigger validation on mount, fixes Ctrl+S after first change not saving
		void form.trigger();

		const { unsubscribe } = form.watch(() => {
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
						data-testid="back-btn"
					>
						<ArrowLeftIcon className="w-6" />
					</ActionIcon>
					Edit &quot;{props.step.fieldDef.name}&quot;
				</SheetTitle>
			</SheetHeader>

			<FormProvider {...form}>
				<FormField
					control={form.control}
					name="displayName"
					render={({ field: formField }) => (
						<FormItem>
							<FormLabel>
								Display name&nbsp;
								<InfoTooltip>
									Only used for displaying a more readable name for this field in
									the page editor
								</InfoTooltip>
							</FormLabel>
							<FormControl>
								<Input
									{...formField}
									{...(props.dialogType === "edit" &&
										getRestorableInputProps(
											!!originalField &&
												originalField.displayName !== formField.value,
											() =>
												form.setValue(
													"displayName",
													originalField!.displayName,
												),
										))}
								/>
							</FormControl>
							<FormError />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="name"
					render={({ field: formField }) => (
						<FormItem>
							<FormLabel>
								Name&nbsp;
								<InfoTooltip>
									Used for identifying this field when your website is fetching
									data from the CMS
								</InfoTooltip>
							</FormLabel>
							<FormControl>
								<Input
									{...formField}
									{...(props.dialogType === "edit" &&
										getRestorableInputProps(
											!!originalField &&
												originalField.name !== formField.value,
											() => form.setValue("name", originalField!.name),
										))}
								/>
							</FormControl>
							<FormError />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="type"
					render={({ field: formField }) => {
						const restorable = getRestorableComboboxProps(
							props.dialogType === "edit" &&
								!!originalField &&
								originalField.type !== formField.value,
							() => {
								form.setValue("type", originalField!.type);
								void form.handleSubmit(onSubmit)();
							},
						);

						return (
							<FormItem>
								<FormLabel>Type</FormLabel>
								<FormControl>
									<div className="flex gap-3">
										<FieldTypePicker
											className={cn("w-full", restorable.className)}
											{...formField}
										/>
										{restorable.restoreButton}
									</div>
								</FormControl>
							</FormItem>
						);
					}}
				/>

				{form.getValues().type === "COLLECTION" && (
					<FormField
						control={form.control}
						name="arrayItemType"
						render={({ field: formField }) => {
							const restorable = getRestorableComboboxProps(
								props.dialogType === "edit" &&
									!!originalField?.arrayItemType &&
									originalField.arrayItemType !== formField.value,
								() => {
									form.setValue("arrayItemType", originalField!.arrayItemType);
									void form.handleSubmit(onSubmit)();
								},
							);

							return (
								<FormItem>
									<FormLabel>Collection item type</FormLabel>
									<FormControl>
										<div className="flex gap-3">
											<FieldTypePicker
												className={cn("w-full", restorable.className)}
												isArrayItemType
												{...formField}
												value={formField.value!}
											/>
											{restorable.restoreButton}
										</div>
									</FormControl>
								</FormItem>
							);
						}}
					/>
				)}
			</FormProvider>
		</>
	);
}
