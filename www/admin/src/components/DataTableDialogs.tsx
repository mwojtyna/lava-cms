import type { FormFieldProps } from "./ui/client/Form";
import { forwardRef, type ComponentRef } from "react";
import { Combobox } from "./Combobox";
import { TypographyMuted } from "./ui/server/typography";

export type MoveDialogInputs = {
	newParentId: string;
};
export type ItemGroup = {
	id: string;
	name: string;
	extraInfo: React.ReactNode;
};

interface NewGroupSelectProps extends FormFieldProps<string> {
	groups: ItemGroup[];
	loading?: boolean;
}
export const NewGroupSelect = forwardRef<ComponentRef<typeof Combobox>, NewGroupSelectProps>(
	(props, ref) => {
		const disabled = props.loading ? false : props.groups.length === 0;

		return (
			<Combobox
				ref={ref}
				className="w-full"
				contentProps={{
					align: "center",
					className: "min-w-[335px] w-fit max-w-[97.5vw] max-h-[47.5vh] overflow-auto",
					placeholder: "Search groups...",
				}}
				placeholder={disabled ? "No valid groups found" : "Select a group..."}
				notFoundContent="No groups found."
				data={
					props.groups.map((group) => ({
						label: <span className="flex items-baseline gap-2">{group.name} </span>,
						description: (
							<TypographyMuted className="text-xs">{group.extraInfo}</TypographyMuted>
						),
						value: group.id,
						filterValue: group.name,
					})) ?? []
				}
				loading={props.loading}
				disabled={disabled}
				value={props.value}
				onChange={props.onChange}
				deselectable
				aria-required
			/>
		);
	},
);
NewGroupSelect.displayName = "NewGroupSelect";
