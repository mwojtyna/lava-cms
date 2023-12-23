import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import React, { forwardRef, useCallback, useEffect, useMemo, useRef } from "react";
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
	ActionIcon,
} from "@/src/components/ui/client";
import { TypographyMuted } from "@/src/components/ui/server";
import { usePageEditor, type ComponentUI } from "@/src/data/stores/pageEditor";
import { cn } from "@/src/utils/styling";

type Input = Record<string, string>; // fieldIndex (order): data
const DEBOUNCE_TIME = 200;

export function ComponentEditor(props: { component: ComponentUI }) {
	const { originalComponents, components, setComponents, setIsValid } = usePageEditor();
	const originalComponent = useMemo(
		() => originalComponents.find((comp) => comp.id === props.component.id),
		[originalComponents, props.component.id],
	);

	const form = useForm<Input>({
		defaultValues: props.component.fields.reduce<Input>((acc, field) => {
			acc[field.order] = field.data;
			return acc;
		}, {}),
		shouldFocusError: false,
		resolver: (values) => {
			const errors: FieldErrors = {};

			for (const [k, v] of Object.entries(values)) {
				const type = props.component.fields.find((field) => field.order.toString() === k)!
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
							data: data[field.order]!,
						})),
						diffs: component.diffs.at(-1) === "added" ? component.diffs : ["edited"],
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
				{props.component.fields.map((field, i) => {
					// Is undefined if the component was only added in the page editor and not yet saved
					const originalField = originalComponent?.fields[i];
					return (
						<FormField
							key={field.id}
							control={form.control}
							name={field.order.toString()}
							render={({ field: formField }) => (
								<FormItem
									className={cn(field.type === "SWITCH" && "flex-row gap-4")}
								>
									<FormLabel>{field.name}</FormLabel>
									<FormControl>
										<Field
											edited={
												originalField
													? field.data !== originalField.data
													: false
											}
											type={field.type}
											onRestore={() => {
												if (!originalField) {
													return;
												}
												form.setValue(
													field.order.toString(),
													originalField.data,
												);
												void form.handleSubmit(onSubmit)();
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

interface FieldProps extends FormFieldProps<string> {
	type: ComponentUI["fields"][number]["type"];
	edited: boolean;
	onRestore: () => void;
}
const Field = forwardRef<HTMLInputElement | HTMLButtonElement, FieldProps>(
	({ type: fieldType, edited, onRestore, value, onChange, ...rest }, ref) => {
		const sharedProps: React.ComponentProps<typeof Input> = {
			inputClassName: cn("transition-colors", edited && "border-b-brand"),
			rightButton: {
				iconOn: <ArrowUturnLeftIcon className="w-4" />,
				iconOff: null,
				tooltip: "Restore",
				onClick: onRestore,
				state: edited,
				setState: null,
			},
		};

		switch (fieldType) {
			case "TEXT": {
				return (
					<Input
						ref={ref as React.RefObject<HTMLInputElement>}
						type="text"
						value={value}
						onChange={(e) => onChange(e.currentTarget.value)}
						{...sharedProps}
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
						{...sharedProps}
						{...rest}
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
								checked={value === "true"}
								onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
								{...rest}
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
		}
	},
);
Field.displayName = "Field";
