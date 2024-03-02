import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { ComponentFieldType, ArrayItemType } from "@prisma/client";
import { cn } from "@udecode/cn";
import Link from "next/link";
import React from "react";
import { Combobox } from "@/src/components/Combobox";
import { Button } from "@/src/components/ui/client/Button";
import type { FormFieldProps } from "@/src/components/ui/client/Form";
import { fieldTypeMap } from "./utils";

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
