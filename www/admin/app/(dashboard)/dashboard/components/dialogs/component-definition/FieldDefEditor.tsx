import type { DialogType, Step } from "./shared";
import type { z } from "zod";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useCallback, useEffect } from "react";
import { useForm, type SubmitHandler, FormProvider } from "react-hook-form";
import { getRestorableComboboxProps } from "@/src/components";
import {
	Input,
	SheetHeader,
	SheetTitle,
	ActionIcon,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormError,
	getRestorableInputProps,
} from "@/src/components/ui/client";
import { useComponentsTableDialogs } from "@/src/data/stores/componentDefinitions";
import { cn } from "@/src/utils/styling";
import { fieldDefinitionUISchema, FieldTypePicker } from "./shared";

const fieldDefDialogSchema = fieldDefinitionUISchema.pick({
	name: true,
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
	const { fields, setFields, originalFields } = useComponentsTableDialogs();
	// Can be undefined if the field was just added in an 'add' type dialog
	const originalField = useMemo(
		() => originalFields.find((f) => f.id === props.step.fieldDef.id),
		[originalFields, props.step.fieldDef.id],
	);

	const form = useForm<Inputs>({
		resolver: zodResolver(fieldDefDialogSchema),
		defaultValues: {
			name: props.step.fieldDef.name,
			type: props.step.fieldDef.type,
			arrayItemType: props.step.fieldDef.arrayItemType ?? "TEXT",
		},
	});
	const onSubmit: SubmitHandler<Inputs> = useCallback(
		(data) => {
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
			setFields(
				fields.map((f) =>
					f.id === props.step.fieldDef.id
						? {
								id: f.id,
								// Don't ever move this, order matters when checking for equality with original fields
								name: data.name,
								type: data.type,
								arrayItemType:
									data.type === "COLLECTION" ? data.arrayItemType : null,
								order: f.order,
								diff: props.step.fieldDef.diff !== "added" ? "edited" : "added",
						  }
						: f,
				),
			);
		},
		[fields, props.step, setFields],
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
				<FormField
					control={form.control}
					name="name"
					render={({ field: formField }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
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
