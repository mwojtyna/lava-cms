import type { Component } from "./types";
import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import { FormProvider, useForm, type SubmitHandler, type FieldErrors } from "react-hook-form";
import type { ComponentFieldTypeType } from "@/prisma/generated/zod";
import {
	Input,
	type FormFieldProps,
	FormField,
	FormItem,
	FormControl,
	FormLabel,
	Checkbox,
	FormError,
} from "@/src/components/ui/client";
import { TypographyMuted } from "@/src/components/ui/server";
import { usePageEditor, type ComponentUI } from "@/src/data/stores/pageEditor";
import { cn } from "@/src/utils/styling";

type Input = Record<string, string>; // fieldId: data
const DEBOUNCE_TIME = 250;

export function ComponentEditor(props: { component: Component }) {
	const { components, setComponents, setIsValid } = usePageEditor();

	const form = useForm<Input>({
		defaultValues: props.component.fields.reduce<Input>((acc, field) => {
			acc[field.id] = field.data;
			return acc;
		}, {}),
		shouldFocusError: false,
		resolver: (values) => {
			const errors: FieldErrors = {};

			for (const [k, v] of Object.entries(values)) {
				const type = props.component.fields.find((field) => field.id === k)!
					.type as ComponentFieldTypeType;

				if (type === "NUMBER" && isNaN(Number(v))) {
					errors[k] = {
						type: "manual",
						message: "Not a number",
					};
				}
			}

			return {
				values,
				errors,
			};
		},
	});
	const onSubmit: SubmitHandler<Input> = useCallback(
		(data: Input) => {
			const changedComponents: ComponentUI[] = components.map((component) => {
				if (component.id === props.component.id) {
					return {
						...component,
						fields: component.fields.map((field) => ({
							...field,
							data: data[field.id]!,
						})),
						diffs: ["edited"],
					};
				} else {
					return component;
				}
			});
			setComponents(changedComponents);
		},
		[components, props.component.id, setComponents],
	);

	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	useEffect(() => {
		// Trigger validation on mount, fixes Ctrl+S after first change not saving
		void form.trigger();

		const { unsubscribe } = form.watch(() => {
			if (timeoutRef.current !== null) {
				clearTimeout(timeoutRef.current);
			}
			timeoutRef.current = setTimeout(() => {
				void form.handleSubmit(onSubmit)();
				setIsValid(form.formState.isValid);
			}, DEBOUNCE_TIME);
		});

		return () => {
			unsubscribe();
			if (timeoutRef.current !== null) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [form, onSubmit, setIsValid]);

	return props.component.fields.length > 0 ? (
		<FormProvider {...form}>
			<form className="flex flex-col gap-4">
				{props.component.fields.map((componentField) => (
					<FormField
						key={componentField.id}
						control={form.control}
						name={componentField.id}
						render={({ field: formField }) => (
							<FormItem
								className={cn(componentField.type === "SWITCH" && "flex-row gap-4")}
							>
								<FormLabel>{componentField.name}</FormLabel>
								<FormControl>
									<Field fieldType={componentField.type} {...formField} />
								</FormControl>
								<FormError />
							</FormItem>
						)}
					/>
				))}
			</form>
		</FormProvider>
	) : (
		<TypographyMuted className="text-center">This component has no fields.</TypographyMuted>
	);
}

// TODO: Spinner when debouncing
// TODO: Button to restore to original values
interface FieldProps extends FormFieldProps<string> {
	fieldType: Component["fields"][number]["type"];
}
const Field = forwardRef<HTMLInputElement | HTMLButtonElement, FieldProps>(
	({ fieldType, value, onChange, ...rest }, ref) => {
		switch (fieldType) {
			case "TEXT": {
				return (
					<Input
						ref={ref as React.RefObject<HTMLInputElement>}
						type="text"
						value={value}
						onChange={(e) => onChange(e.currentTarget.value)}
						{...rest}
					/>
				);
			}
			case "NUMBER": {
				return (
					<Input
						ref={ref as React.RefObject<HTMLInputElement>}
						step="any"
						value={value}
						onChange={(e) => onChange(e.currentTarget.value)}
						{...rest}
					/>
				);
			}
			case "SWITCH": {
				return (
					<Checkbox
						ref={ref as React.RefObject<HTMLButtonElement>}
						checked={value === "true"}
						onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
						{...rest}
					/>
				);
			}
		}
	},
);
Field.displayName = "Field";