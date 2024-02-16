import type { ComponentsTableComponentDef } from "../../ComponentsTable";
import type { inferRouterOutputs } from "@trpc/server";
import { ArrowTopRightOnSquareIcon, FolderIcon } from "@heroicons/react/24/outline";
import { ArrayItemType, ComponentFieldType } from "@prisma/client";
import Link from "next/link";
import * as React from "react";
import { z } from "zod";
import { ArrayItemTypeSchema, ComponentDefinitionFieldSchema } from "@/prisma/generated/zod";
import { Combobox } from "@/src/components/Combobox";
import type { ItemParent } from "@/src/components/DataTableDialogs";
import { Button } from "@/src/components/ui/client/Button";
import type { FormFieldProps } from "@/src/components/ui/client/Form";
import type { PrivateRouter } from "@/src/trpc/routes/private/_private";
import { cn } from "@/src/utils/styling";

// ---------------- TYPES ----------------
export const fieldDefinitionUISchema = z.object({
	id: z.string().cuid(),
	name: z.string().min(1, { message: " " }),
	type: ComponentDefinitionFieldSchema.shape.type,
	arrayItemType: ArrayItemTypeSchema.nullable(),
	order: z.number(),
	diff: z.union([
		z.literal("none"),
		z.literal("added"),
		z.literal("deleted"),
		z.literal("edited"),
	]),
	reordered: z.boolean(),
});
export type FieldDefinitionUI = z.infer<typeof fieldDefinitionUISchema>;

export type DialogType = "add" | "edit";
export type Step =
	| {
			name: "component-definition";
			componentDef: ComponentsTableComponentDef;
	  }
	| {
			name: "field-definition";
			fieldDef: FieldDefinitionUI;
	  };

// ---------------- FUNCTIONS ----------------
export function groupsToComboboxEntries(
	groups: inferRouterOutputs<PrivateRouter>["components"]["getAllGroups"],
): ItemParent[] {
	return groups.map((group) => ({
		id: group.id,
		name: group.name,
		extraInfo: (
			<span className="flex items-center">
				{group.parent_group_name && (
					<>
						in&nbsp;
						<FolderIcon className="inline w-[14px]" />
						&nbsp;
						{group.parent_group_name},&nbsp;
					</>
				)}
				contains {group.children_count.toString()}{" "}
				{group.children_count === 1 ? "item" : "items"}
			</span>
		),
	}));
}

// ---------------- COMPONENTS ----------------
export const fieldTypeMap: Record<string, string> = Object.values(ComponentFieldType).reduce<
	Record<string, string>
>((acc, type) => {
	const split: string[] = [];
	for (const word of type.split("_")) {
		const part = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		split.push(part);
	}

	acc[type] = split.join(" ");
	return acc;
}, {});

interface FieldTypePickerProps extends FormFieldProps<ComponentFieldType> {
	className?: string;
	onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
	placeholder?: string;
	isArrayItemType?: boolean;
}
export const FieldTypePicker = React.forwardRef<
	React.ComponentRef<typeof Combobox>,
	FieldTypePickerProps
>(({ value, onChange, className, placeholder, isArrayItemType, ...props }, ref) => {
	const fieldTypes = React.useMemo(
		() =>
			Object.values(isArrayItemType ? ArrayItemType : ComponentFieldType).map((type) => ({
				value: type,
				label: fieldTypeMap[type]!,
				description: "",
				filterValue: fieldTypeMap[type]!,
			})),
		[isArrayItemType],
	);

	return (
		<Combobox
			ref={ref}
			className={cn("border border-input !outline-none", className)}
			data={fieldTypes}
			notFoundContent={"No types found."}
			contentProps={{
				className: "w-[165px]",
				placeholder: "Search types...",
				align: "start",
			}}
			placeholder={placeholder}
			value={value}
			onChange={onChange}
			{...props}
		/>
	);
});
FieldTypePicker.displayName = "FieldTypePicker";

export function ComponentDefinitionNameError(props: {
	name: string;
	group: { name: string; id: string };
}) {
	return (
		<>
			A component definition with name{" "}
			<strong className="whitespace-nowrap">{props.name}</strong> already exists in group{" "}
			<Button className="inline-flex gap-0.5 font-bold text-destructive" variant={"link"}>
				<Link href={`/dashboard/components/${props.group.id}`} target="_blank">
					{props.group.name}
				</Link>
				<ArrowTopRightOnSquareIcon className="w-4" />
			</Button>
		</>
	);
}
