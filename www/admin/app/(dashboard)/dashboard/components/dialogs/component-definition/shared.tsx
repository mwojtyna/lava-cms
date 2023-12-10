import type { inferRouterOutputs } from "@trpc/server";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { FolderIcon } from "@heroicons/react/24/outline";
import { ComponentFieldType } from "@prisma/client";
import Link from "next/link";
import * as React from "react";
import { z } from "zod";
import {
	ComponentDefinitionFieldSchema,
	type ComponentFieldTypeType,
} from "@admin/prisma/generated/zod";
import { Combobox, type ComboboxData, type ItemParent } from "@admin/src/components";
import { Button, type FormFieldProps } from "@admin/src/components/ui/client";
import type { PrivateRouter } from "@admin/src/trpc/routes/private/_private";
import { cn } from "@admin/src/utils/styling";

export const fieldTypeMap: Record<string, string> = Object.values(ComponentFieldType).reduce(
	(acc, type) => {
		const label = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
		acc[type] = label;

		return acc;
	},
	{} as Record<string, string>,
);

interface FieldTypePickerProps extends FormFieldProps<ComponentFieldTypeType> {
	className?: string;
	onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}
export const FieldTypePicker = React.forwardRef<
	React.ComponentRef<typeof Combobox>,
	FieldTypePickerProps
>(({ value, onChange, className, ...props }, ref) => {
	const fieldTypes = React.useMemo(
		() =>
			Object.values(ComponentFieldType).map((type) => {
				return {
					value: type,
					label: fieldTypeMap[type]!,
					description: "",
					filterValue: fieldTypeMap[type]!,
				};
			}) satisfies ComboboxData,
		[],
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
			}}
			placeholder="Type"
			value={value}
			onChange={onChange}
			{...props}
		/>
	);
});
FieldTypePicker.displayName = "FieldTypePicker";

export const fieldDefinitionUISchema = z.object({
	id: z.string().cuid().optional(),
	name: z.string().min(1),
	type: ComponentDefinitionFieldSchema.shape.type,
	diffs: z.array(z.union([z.literal("added"), z.literal("deleted"), z.literal("edited")])),
});
export type FieldDefinitionUI = z.infer<typeof fieldDefinitionUISchema>;

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

export function groupsToComboboxEntries(
	groups: inferRouterOutputs<PrivateRouter>["components"]["getAllGroups"],
): ItemParent[] {
	return groups.map(
		(group) =>
			({
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
			}) satisfies ItemParent,
	);
}
