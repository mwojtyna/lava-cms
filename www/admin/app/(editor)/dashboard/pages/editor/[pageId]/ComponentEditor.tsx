import type { Value } from "@udecode/plate-common";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import React, { forwardRef, useEffect, useMemo, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { RichTextEditor } from "@/src/components/RichTextEditor";
import {
	type Input,
	type FormFieldProps,
	FormField,
	FormItem,
	FormControl,
	FormLabel,
	Checkbox,
	FormError,
	ActionIcon,
	NumberInput,
	getRestorableNumberInputProps,
	Textarea,
	getRestorableTextareaProps,
} from "@/src/components/ui/client";
import { TypographyMuted } from "@/src/components/ui/server";
import { usePageEditor, type ComponentUI, type FieldUI } from "@/src/data/stores/pageEditor";
import { cn } from "@/src/utils/styling";
import { ArrayField } from "./fields/ArrayField";
import { NestedComponentField } from "./fields/NestedComponentField";

type Input = Record<string, string>; // fieldId: data

interface ComponentEditorProps {
	component: ComponentUI;
	onChange: (data: Input) => void;
}
export function ComponentEditor(props: ComponentEditorProps) {
	const { originalComponents, originalNestedComponents, setIsValid } = usePageEditor();
	const originalComponent = useMemo(
		() =>
			(props.component.parentComponentId === null
				? originalComponents
				: originalNestedComponents
			).find((comp) => comp.id === props.component.id),
		[originalComponents, originalNestedComponents, props.component],
	);

	const form = useForm<Input>({
		values: props.component.fields.reduce<Input>((acc, field) => {
			acc[field.id] = field.data;
			return acc;
		}, {}),
		shouldFocusError: false,
	});

	const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	useEffect(() => {
		// Trigger validation on mount, fixes Ctrl+S after first change not saving
		void form.trigger();

		const { unsubscribe } = form.watch(() => {
			setIsValid(form.formState.isValid);

			if (debounceTimeoutRef.current !== null) {
				clearTimeout(debounceTimeoutRef.current);
			}
			debounceTimeoutRef.current = setTimeout(() => {
				props.onChange(form.getValues());
			}, 250);
		});

		return () => {
			unsubscribe();
			if (debounceTimeoutRef.current !== null) {
				clearTimeout(debounceTimeoutRef.current);
			}
		};
	}, [form, props, setIsValid]);

	return props.component.fields.length > 0 ? (
		<FormProvider {...form}>
			<form className="flex flex-col gap-5">
				{props.component.fields.map((field, i) => {
					// Is undefined if the component was only added in the page editor and not yet saved
					const originalField = originalComponent?.fields[i];

					let edited = false;
					if (field.type === "RICH_TEXT") {
						if (
							props.component.diff !== "added" &&
							JSON.stringify(field.data) !== JSON.stringify(originalField?.data)
						) {
							edited = true;
						}
					} else {
						if (props.component.diff !== "replaced" && originalField) {
							edited = field.data !== originalField.data;
						}
					}

					return (
						<FormField
							key={field.id}
							control={form.control}
							name={field.id}
							render={({ field: formField }) => (
								<FormItem
									className={cn(field.type === "SWITCH" && "flex-row", "gap-3")}
								>
									<FormLabel>{field.name}</FormLabel>
									<FormControl>
										<Field
											component={props.component}
											edited={edited}
											field={field}
											onRestore={() => {
												form.setValue(field.id, originalField!.data);
												void form.handleSubmit(props.onChange)();
												setIsValid(form.formState.isValid);
											}}
											{...formField}
										/>
									</FormControl>
									<FormError />
								</FormItem>
							)}
						/>
					);
				})}
			</form>
		</FormProvider>
	) : (
		<TypographyMuted className="text-center">This component has no fields.</TypographyMuted>
	);
}

export interface FieldProps extends FormFieldProps<string> {
	className?: string;
	component: ComponentUI;
	field: Pick<FieldUI, "id" | "type" | "arrayItemType">;
	edited: boolean;
	onRestore: () => void;
}
export const Field = forwardRef<HTMLTextAreaElement | HTMLButtonElement, FieldProps>(
	({ className, component, field, edited, onRestore, value, onChange }, ref) => {
		switch (field.type) {
			case "TEXT": {
				const inputProps = getRestorableTextareaProps(edited, onRestore);
				return (
					<Textarea
						ref={ref as React.RefObject<HTMLTextAreaElement>}
						className={cn(className, edited && "border-b-brand")}
						value={value}
						onChange={(e) => onChange(e.currentTarget.value.replaceAll("\n", ""))}
						{...inputProps}
					/>
				);
			}
			case "RICH_TEXT": {
				return (
					// FIX: Upon restore, the value is not updated
					<RichTextEditor
						// Rich text editor's value is an object instead of a string
						value={value as unknown as Value}
						onChange={(v) => onChange(v as unknown as string)}
						edited={edited}
						onRestore={onRestore}
					/>
				);
			}
			case "NUMBER": {
				const inputProps = getRestorableNumberInputProps(edited, onRestore);
				return (
					<NumberInput
						getInputRef={ref as React.RefObject<HTMLInputElement>}
						className={cn(className)}
						value={value}
						onChange={(e) => onChange(e.currentTarget.value)}
						{...inputProps}
					/>
				);
			}
			case "SWITCH": {
				return (
					<div className="flex items-center gap-3">
						<div
							className={cn(
								edited &&
									"rounded ring-2 ring-brand ring-offset-2 ring-offset-black",
							)}
						>
							<Checkbox
								ref={ref as React.RefObject<HTMLButtonElement>}
								className={className}
								checked={value === "true"}
								onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
							/>
						</div>

						{edited && (
							<ActionIcon variant={"simple"} onClick={onRestore} tooltip="Restore">
								<ArrowUturnLeftIcon className="w-4" />
							</ActionIcon>
						)}
					</div>
				);
			}
			case "COMPONENT": {
				return (
					<NestedComponentField
						className={className}
						value={value}
						onChange={onChange}
						edited={edited}
						parentComponent={component}
					/>
				);
			}
			case "COLLECTION": {
				return <ArrayField parentField={field} component={component} />;
			}
		}
	},
);
Field.displayName = "Field";
