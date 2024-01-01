import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { createId } from "@paralleldrive/cuid2";
import React, { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
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
	Button,
} from "@/src/components/ui/client";
import { TypographyMuted } from "@/src/components/ui/server";
import { usePageEditor, type ComponentUI } from "@/src/data/stores/pageEditor";
import { cn } from "@/src/utils/styling";
import { trpcFetch } from "@/src/utils/trpc";
import { ComponentCard } from "./Components";
import { AddComponentDialog } from "./dialogs/AddComponentDialog";

type Input = Record<string, string>; // fieldIndex (order): data

export function ComponentEditor(props: { component: ComponentUI }) {
	const { originalComponents, components, setComponents, setIsValid } = usePageEditor();

	const originalComponent = useMemo(
		() => originalComponents.find((comp) => comp.id === props.component.id),
		[originalComponents, props.component.id],
	);

	const form = useForm<Input>({
		values: props.component.fields.reduce<Input>((acc, field) => {
			acc[field.order] = field.data;
			return acc;
		}, {}),
		shouldFocusError: false,
		resolver: (values) => {
			const errors: FieldErrors = {};
			if (props.component.fields.length === 0) {
				return { values, errors };
			}

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
			// TODO: Move out to props
			const changedComponents: ComponentUI[] = components.map((component) => {
				if (component.id === props.component.id) {
					return {
						...component,
						fields: component.fields.map((field) => ({
							...field,
							data: data[field.order]!,
						})),
						diff: component.diff === "added" ? component.diff : "edited",
					};
				} else {
					return component;
				}
			});
			setComponents(changedComponents);
		},
		[components, props.component.id, setComponents],
	);

	useEffect(() => {
		// Trigger validation on mount, fixes Ctrl+S after first change not saving
		void form.trigger();

		// TODO: Optimize
		const { unsubscribe } = form.watch(() => {
			setIsValid(form.formState.isValid);
			if (form.formState.isValid && !form.formState.isValidating) {
				void form.handleSubmit(onSubmit)();
			}
		});

		return unsubscribe;
	}, [form, onSubmit, setIsValid]);

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
							name={field.order.toString()}
							render={({ field: formField }) => (
								<FormItem
									className={cn(field.type === "SWITCH" && "flex-row", "gap-3")}
								>
									<FormLabel>{field.name}</FormLabel>
									<FormControl>
										<Field
											component={props.component}
											edited={
												originalField
													? field.data !== originalField.data
													: false
											}
											type={field.type}
											onRestore={() => {
												form.setValue(
													field.order.toString(),
													originalField!.data,
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

export interface FieldProps extends FormFieldProps<string> {
	component: ComponentUI;
	type: ComponentUI["fields"][number]["type"];
	edited: boolean;
	onRestore: () => void;
}
const Field = forwardRef<HTMLInputElement | HTMLButtonElement, FieldProps>(
	({ type: fieldType, edited, onRestore, value, onChange, component, ...rest }, ref) => {
		const inputProps: React.ComponentProps<typeof Input> = {
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
						{...inputProps}
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
						{...inputProps}
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
			case "COMPONENT": {
				return (
					<NestedComponentField
						value={value}
						onChange={onChange}
						edited={edited}
						onRestore={onRestore}
						component={component}
					/>
				);
			}
		}
	},
);
Field.displayName = "Field";

type NestedComponentFieldProps = Omit<FieldProps, "type">;
export function NestedComponentField(props: NestedComponentFieldProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const { steps, setSteps, nestedComponents, setNestedComponents } = usePageEditor();

	const [component, setComponent] = useState<ComponentUI | null>(
		nestedComponents.find((comp) => comp.id === props.value) ?? null,
	);
	useEffect(() => {
		setComponent(nestedComponents.find((comp) => comp.id === props.value) ?? null);
	}, [nestedComponents, props.value]);
	console.log(nestedComponents);

	async function selectComponent(id: string) {
		const definition = await trpcFetch.components.getComponentDefinition.query({ id });
		const component: ComponentUI = {
			id: createId(),
			definition: {
				id: definition.id,
				name: definition.name,
			},
			fields: definition.field_definitions.map((fieldDef, i) => ({
				id: i.toString(),
				name: fieldDef.name,
				data: "",
				definitionId: fieldDef.id,
				order: fieldDef.order,
				type: fieldDef.type,
			})),
			order: 0,
			pageId: props.component.pageId,
			parentComponentId: props.component.id,
			diff: "added",
		};
		setNestedComponents([...nestedComponents, component]);
		props.onChange(component.id);
	}

	function remove(component: ComponentUI) {
		setNestedComponents(
			nestedComponents.map((c) => {
				if (c.id === component.id) {
					return {
						...c,
						diff: "deleted",
					};
				} else {
					return c;
				}
			}),
		);
	}
	function unRemove(component: ComponentUI) {
		setNestedComponents(
			nestedComponents.map((c) => {
				if (c.id === component.id) {
					return {
						...c,
						diff: "none",
					};
				} else {
					return c;
				}
			}),
		);
	}
	function unAdd(component: ComponentUI) {
		setNestedComponents(nestedComponents.filter((c) => c.id !== component.id));
	}

	return (
		<>
			{!component ? (
				<Button variant={"outline"} onClick={() => setDialogOpen(true)}>
					Select component
				</Button>
			) : (
				<ComponentCard
					dndId="0"
					noDrag
					component={{
						id: component.id,
						name: component.definition.name,
						diff: component.diff,
					}}
					onClick={() =>
						setSteps([
							...steps,
							{ name: "edit-nested-component", nestedComponentId: component.id },
						])
					}
					onRestore={props.onRestore}
					onRemove={() => remove(component)}
					onUnRemove={() => unRemove(component)}
					onUnAdd={() => unAdd(component)}
				/>
			)}

			<AddComponentDialog
				open={dialogOpen}
				setOpen={setDialogOpen}
				onSubmit={selectComponent}
			/>
		</>
	);
}
