import * as React from "react";
import { Combobox, type ComboboxData } from "@admin/src/components";
import { ComponentFieldType } from "@prisma/client";
import type { ComponentFieldTypeType } from "@admin/prisma/generated/zod";
import { cn } from "@admin/src/utils/styling";

export const fieldTypeMap: Record<string, string> = Object.values(ComponentFieldType).reduce(
	(acc, type) => {
		const label = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
		acc[type] = label;

		return acc;
	},
	{} as Record<string, string>,
);

interface FieldTypePickerProps {
	value: ComponentFieldTypeType;
	onChange: (value: ComponentFieldTypeType) => void;
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
