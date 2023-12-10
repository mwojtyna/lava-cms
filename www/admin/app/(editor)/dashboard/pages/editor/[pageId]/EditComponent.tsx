import type { Component } from "./types";
import React, { forwardRef } from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import {
	Input,
	type FormFieldProps,
	FormField,
	FormItem,
	FormControl,
	FormLabel,
	Checkbox,
	FormError,
} from "@admin/src/components/ui/client";
import { TypographyMuted } from "@admin/src/components/ui/server";
import { cn } from "@admin/src/utils/styling";

type Input = any;

// TODO: Keep state local, only submit to API when clicking save (like in Storyblok)
// Keep whole json from `getPageComponents` in state
// Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z, Ctrl+S

export function EditComponent(props: { component: Component }) {
	const form = useForm<Input>({
		defaultValues: props.component.fields.reduce<Record<string, any>>((acc, field) => {
			acc[field.id] = field.data;
			return acc;
		}, {}),
	});

	const onSubmit: SubmitHandler<Input> = (data) => {};

	return props.component.fields.length > 0 ? (
		<FormProvider {...form}>
			<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
				{props.component.fields.map((componentField, i) => (
					<FormField
						key={i}
						control={form.control}
						name={componentField.id}
						render={({ field: formField }) => (
							<FormItem
								className={cn(
									componentField.definition.type === "SWITCH" && "flex-row gap-4",
								)}
							>
								<FormLabel>{componentField.definition.name}</FormLabel>
								<FormControl>
									<Field
										fieldType={componentField.definition.type}
										{...formField}
									/>
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

interface FieldProps extends FormFieldProps<string> {
	fieldType: Component["fields"][number]["definition"]["type"];
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
						type="number"
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
