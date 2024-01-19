import type { DialogType, Step } from "./shared";
import type { z } from "zod";
import { ArrowUturnLeftIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWindowEvent } from "@mantine/hooks";
import { useMemo, useCallback, useEffect } from "react";
import { useForm, type SubmitHandler, FormProvider } from "react-hook-form";
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
} from "@/src/components/ui/client";
import { useComponentsTableDialogs } from "@/src/data/stores/componentDefinitions";
import { cn } from "@/src/utils/styling";
import { fieldDefinitionUISchema, FieldTypePicker } from "./shared";

const fieldDefDialogSchema = fieldDefinitionUISchema.pick({ name: true, type: true });
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

	function getInputProps(
		edited: boolean,
		restore: () => void,
	): React.ComponentProps<typeof Input> {
		if (props.dialogType === "edit") {
			return {
				inputClassName: cn("transition-colors", edited && "border-b-brand"),
				rightButton: {
					iconOn: <ArrowUturnLeftIcon className="w-4" />,
					iconOff: null,
					tooltip: "Restore",
					onClick: () => {
						restore();
						void form.handleSubmit(onSubmit)();
					},
					state: edited,
					setState: null,
				},
			};
		} else {
			return {};
		}
	}

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
						render={({ field: formField }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input
										{...formField}
										{...(props.dialogType !== "add" &&
											getInputProps(
												originalField!.name !== formField.value,
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
						render={({ field: formField }) => (
							<FormItem>
								<FormLabel>Type</FormLabel>
								<FormControl>
									<div className="flex gap-3">
										<FieldTypePicker
											className={cn(
												"w-full",
												props.dialogType === "edit" &&
													originalField!.type !== formField.value &&
													"ring-2 ring-brand ring-offset-2 ring-offset-black",
											)}
											{...formField}
										/>
										{props.dialogType === "edit" &&
											originalField!.type !== formField.value && (
												<ActionIcon
													variant={"simple"}
													onClick={() => {
														form.setValue("type", originalField!.type);
														void form.handleSubmit(onSubmit)();
													}}
												>
													<ArrowUturnLeftIcon className="w-5" />
												</ActionIcon>
											)}
									</div>
								</FormControl>
							</FormItem>
						)}
					/>
				</form>
			</FormProvider>
		</>
	);
}
