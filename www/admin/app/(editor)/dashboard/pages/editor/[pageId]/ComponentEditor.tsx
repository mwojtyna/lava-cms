import type { Value } from "@udecode/plate-common";
import React, { forwardRef, useMemo, useRef } from "react";
import { FormProvider, useForm, type ControllerRenderProps } from "react-hook-form";
import { RichTextEditor } from "@/src/components/RichTextEditor";
import { Checkbox } from "@/src/components/ui/client/Checkbox";
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormError,
	type FormFieldProps,
} from "@/src/components/ui/client/Form";
import { NumberInput } from "@/src/components/ui/client/NumberInput";
import { Textarea } from "@/src/components/ui/client/Textarea";
import { TypographyMuted } from "@/src/components/ui/server/typography";
import { usePageEditorStore, type ComponentUI, type FieldUI } from "@/src/data/stores/pageEditor";
import { cn } from "@/src/utils/styling";
import { ArrayField } from "./fields/ArrayField";
import { NestedComponentField } from "./fields/NestedComponentField";

type Input = Record<string, string>; // fieldId -> data

interface ComponentEditorProps {
	component: ComponentUI;
	onChange: (data: Input) => void;
}
export function ComponentEditor(props: ComponentEditorProps) {
	const { originalComponents, originalNestedComponents, setIsTyping } = usePageEditorStore(
		(state) => ({
			originalComponents: state.originalComponents,
			originalNestedComponents: state.originalNestedComponents,
			setIsTyping: state.setIsTyping,
		}),
	);
	const originalComponent = useMemo(
		() =>
			(props.component.parentFieldId === null && props.component.parentArrayItemId === null
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
	function onFieldChanged(
		field: FieldUI,
		formField: ControllerRenderProps<Input, string>,
		value: string,
	) {
		formField.onChange(value);

		if (debounceTimeoutRef.current !== null) {
			clearTimeout(debounceTimeoutRef.current);
		}

		if (field.type !== "SWITCH") {
			setIsTyping(true);
			debounceTimeoutRef.current = setTimeout(() => {
				props.onChange(form.getValues());
				setIsTyping(false);
				debounceTimeoutRef.current = null;
			}, 250);
		} else {
			props.onChange(form.getValues());
		}
	}

	return props.component.fields.length > 0 ? (
		<FormProvider {...form}>
			<form className="flex flex-col gap-5">
				{props.component.fields.map((field, i) => {
					// Is undefined if the component was only added in the page editor and not yet saved
					const originalField = originalComponent?.fields[i];
					return (
						<FormField
							key={field.id}
							control={form.control}
							name={field.id}
							render={({ field: formField }) => {
								// I don't know how the hell, but formField.value is an empty string for one render
								// when the form is first mounted when the field is a rich text field
								const value =
									field.type === "RICH_TEXT" ? field.data : formField.value;
								return (
									<FormItem
										className={cn(
											field.type === "SWITCH" && "flex-row",
											"gap-3",
										)}
									>
										<FormLabel>{field.displayName}</FormLabel>
										<FormControl>
											<Field
												component={props.component}
												field={field}
												originalValue={originalField?.data}
												onRestore={() => {
													form.setValue(field.id, originalField!.data);
													void form.handleSubmit(props.onChange)();
												}}
												{...formField}
												value={value}
												onChange={(v) =>
													onFieldChanged(field, formField, v)
												}
											/>
										</FormControl>
										<FormError />
									</FormItem>
								);
							}}
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
	originalValue?: string;
	onRestore: () => void;
}
export const Field = forwardRef<HTMLTextAreaElement | HTMLButtonElement, FieldProps>(
	({ className, component, field, onRestore, value, onChange, originalValue }, ref) => {
		switch (field.type) {
			case "TEXT": {
				return (
					<Textarea
						ref={ref as React.RefObject<HTMLTextAreaElement>}
						className={className}
						value={value}
						onChange={(e) => onChange(e.currentTarget.value.replaceAll("\n", ""))}
					/>
				);
			}
			case "RICH_TEXT": {
				return (
					<RichTextEditor
						// Rich text editor's value is an object instead of a string
						value={value as unknown as Value}
						onChange={(v) => onChange(v as unknown as string)}
						originalValue={originalValue as unknown as Value | undefined}
						onRestore={onRestore}
						pageId={component.pageId}
					/>
				);
			}
			case "NUMBER": {
				return (
					<NumberInput
						getInputRef={ref as React.RefObject<HTMLInputElement>}
						className={className}
						value={value}
						onChange={(e) => onChange(e.currentTarget.value)}
					/>
				);
			}
			case "SWITCH": {
				return (
					<Checkbox
						ref={ref as React.RefObject<HTMLButtonElement>}
						className={className}
						checked={value === "true"}
						onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
					/>
				);
			}
			case "COMPONENT": {
				return (
					<NestedComponentField
						className={className}
						parentFieldId={field.id}
						parentArrayItemId={null}
						pageId={component.pageId}
					/>
				);
			}
			case "COLLECTION": {
				return <ArrayField parentField={field} parentComponent={component} />;
			}
		}
	},
);
Field.displayName = "Field";
