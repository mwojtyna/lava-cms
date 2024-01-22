import { ArrowPathRoundedSquareIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { createId } from "@paralleldrive/cuid2";
import React, { forwardRef, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, type FieldErrors } from "react-hook-form";
import type { ComponentFieldTypeType } from "@/prisma/generated/zod";
import {
	Input,
	getRestorableInputProps,
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

	useEffect(() => {
		// Trigger validation on mount, fixes Ctrl+S after first change not saving
		void form.trigger();

		// TODO: Optimize
		const { unsubscribe } = form.watch(() => {
			setIsValid(form.formState.isValid);
			if (form.formState.isValid && !form.formState.isValidating) {
				void form.handleSubmit(props.onChange)();
			}
		});

		return unsubscribe;
	}, [form, props.onChange, setIsValid]);

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
												props.component.diff !== "replaced" && originalField
													? field.data !== originalField.data
													: false
											}
											type={field.type}
											onRestore={() => {
												form.setValue(
													field.order.toString(),
													originalField!.data,
												);
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
	component: ComponentUI;
	type: ComponentUI["fields"][number]["type"];
	edited: boolean;
	onRestore: () => void;
}
const Field = forwardRef<HTMLInputElement | HTMLButtonElement, FieldProps>(
	({ type: fieldType, edited, onRestore, value, onChange, component, ...rest }, ref) => {
		const inputProps = getRestorableInputProps(edited, onRestore);

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
						onChange={(id, nestedComponents) => {
							onChange(id);
							usePageEditor.setState({ nestedComponents });
						}}
						edited={edited}
						component={component}
					/>
				);
			}
			case "ARRAY": {
				// TODO: Implement
				return "<Array editor>";
			}
		}
	},
);
Field.displayName = "Field";

interface NestedComponentFieldProps {
	component: ComponentUI;
	edited: boolean;
	value: string;
	onChange: (id: string, nestedComponents: ComponentUI[]) => void;
}
export function NestedComponentField(props: NestedComponentFieldProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const { steps, setSteps, originalNestedComponents, nestedComponents, setNestedComponents } =
		usePageEditor();

	const currentComponent = useMemo(
		() => nestedComponents.find((comp) => comp.id === props.value),
		[nestedComponents, props.value],
	);
	const originalComponent = useMemo(
		() => originalNestedComponents.find((comp) => comp.id === props.value),
		[originalNestedComponents, props.value],
	);

	async function selectComponent(id: string) {
		const definition = await trpcFetch.components.getComponentDefinition.query({ id });
		const newComponent: ComponentUI = {
			// When replacing component, keep the id
			id: currentComponent?.id ?? createId(),
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
			diff: currentComponent ? "replaced" : "added",
		};

		props.onChange(
			newComponent.id,
			currentComponent
				? nestedComponents.map((c) => (c.id === currentComponent.id ? newComponent : c))
				: [...nestedComponents, newComponent],
		);
	}

	function restore() {
		props.onChange(
			originalComponent!.id,
			nestedComponents.map((c) => (c.id === originalComponent!.id ? originalComponent! : c)),
		);
	}
	function remove(component: ComponentUI) {
		setNestedComponents(
			nestedComponents.map((c) => (c.id === component.id ? { ...c, diff: "deleted" } : c)),
		);
	}
	function unRemove(component: ComponentUI) {
		setNestedComponents(
			nestedComponents.map((c) => (c.id === component.id ? { ...c, diff: "none" } : c)),
		);
	}
	function unAdd(component: ComponentUI) {
		props.onChange(
			"",
			nestedComponents.filter((c) => c.id !== component.id),
		);
	}

	return (
		<>
			{currentComponent && (
				<div className="grid grid-flow-col grid-cols-[1fr_auto] gap-2">
					<ComponentCard
						dndId="0"
						noDrag
						component={{
							id: currentComponent.id,
							name: currentComponent.definition.name,
							diff: currentComponent.diff,
						}}
						onClick={() =>
							setSteps([
								...steps,
								{
									name: "edit-nested-component",
									nestedComponentId: currentComponent.id,
								},
							])
						}
						extraActions={
							currentComponent.diff !== "added" &&
							currentComponent.diff !== "deleted" && (
								<ActionIcon
									className="mx-1"
									variant={"simple"}
									tooltip="Change"
									onClick={(e) => {
										e.stopPropagation();
										setDialogOpen(true);
									}}
								>
									<ArrowPathRoundedSquareIcon className="w-5" />
								</ActionIcon>
							)
						}
						onRestore={restore}
						onRemove={() => remove(currentComponent)}
						onUnRemove={() => unRemove(currentComponent)}
						onUnAdd={() => unAdd(currentComponent)}
					/>
				</div>
			)}
			{!currentComponent && (
				<Button variant={"outline"} onClick={() => setDialogOpen(true)}>
					Select component
				</Button>
			)}

			<AddComponentDialog
				open={dialogOpen}
				setOpen={setDialogOpen}
				onSubmit={selectComponent}
			/>
		</>
	);
}
