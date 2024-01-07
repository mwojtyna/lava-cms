import type { FormFieldProps } from "./ui/client";
import { forwardRef, type ComponentRef } from "react";
import { Combobox } from "./Combobox";
import { TypographyMuted } from "./ui/server";

export interface MoveDialogInputs {
	newParentId: string;
}
export interface ItemParent {
	id: string;
	name: string;
	extraInfo: React.ReactNode;
}

interface NewParentSelectProps extends FormFieldProps<string> {
	parents: ItemParent[];
}
export const NewParentSelect = forwardRef<ComponentRef<typeof Combobox>, NewParentSelectProps>(
	(props, ref) => {
		return (
			<Combobox
				ref={ref}
				className="w-full"
				contentProps={{
					align: "center",
					className: "min-w-[335px] w-fit max-w-[97.5vw] max-h-[47.5vh] overflow-auto",
					placeholder: "Search groups...",
				}}
				placeholder="Select a group..."
				notFoundContent="No groups found."
				data={
					props.parents.map((group) => ({
						label: <span className="flex items-baseline gap-2">{group.name} </span>,
						description: (
							<TypographyMuted className="text-xs">{group.extraInfo}</TypographyMuted>
						),
						value: group.id,
						filterValue: group.name,
					})) ?? []
				}
				aria-required
				{...props}
			/>
		);
	},
);
NewParentSelect.displayName = "NewParentSelect";
