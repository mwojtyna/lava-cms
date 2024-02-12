"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormError,
} from "@/src/components/ui/client/Form";
import { Input, getRestorableInputProps } from "@/src/components/ui/client/Input";
import { SheetHeader, SheetTitle } from "@/src/components/ui/client/Sheet";
import { TypographyMuted } from "@/src/components/ui/server/typography";
import { AddFieldDefs, FieldDefs } from "./FieldDefinitions";
import { type DialogType, type Step } from "./shared";

export const componentDefEditorInputsSchema = z.object({
	name: z.string().min(1, { message: " " }),
});
export type ComponentDefEditorInputs = z.infer<typeof componentDefEditorInputsSchema>;

interface ComponentDefEditorProps {
	step: Extract<Step, { name: "component-definition" }>;
	setSteps: React.Dispatch<React.SetStateAction<Step[]>>;

	open: boolean;
	setOpen: (value: boolean) => void;
	onSubmit: () => void;

	dialogType: DialogType;
	title: string;
}
export function ComponentDefEditor(props: ComponentDefEditorProps) {
	const form = useFormContext();

	return (
		<>
			<SheetHeader>
				<SheetTitle>{props.title}</SheetTitle>
			</SheetHeader>

			<FormField
				control={form.control}
				name="name"
				render={({ field, fieldState }) => (
					<FormItem>
						<FormLabel>
							Name&nbsp;
							<TypographyMuted>(unique)</TypographyMuted>
						</FormLabel>
						<FormControl>
							<Input
								{...field}
								{...(props.dialogType === "edit" &&
									getRestorableInputProps(fieldState.isDirty, () =>
										form.resetField("name"),
									))}
								aria-required
							/>
						</FormControl>
						<FormError />
					</FormItem>
				)}
			/>
			<FormItem>
				<FormLabel>Fields</FormLabel>
				<AddFieldDefs />
			</FormItem>

			<FieldDefs
				dialogType={props.dialogType}
				onFieldClick={(field) =>
					props.setSteps((steps) => [
						...steps,
						{ name: "field-definition", fieldDef: field },
					])
				}
			/>
		</>
	);
}
