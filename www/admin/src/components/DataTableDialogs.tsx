import type { Path, UseFormReturn } from "react-hook-form";
import { FormControl, FormError, FormField, FormItem, FormLabel } from "./ui/client";
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

interface NewParentSelectProps<T extends MoveDialogInputs> {
	form: UseFormReturn<T>;
	parents: ItemParent[];
	label?: string;
}
export function NewParentSelect<T extends MoveDialogInputs>(props: NewParentSelectProps<T>) {
	return (
		<FormField
			control={props.form.control}
			name={"newParentId" as Path<T>}
			render={({ field }) => (
				<FormItem>
					{props.label && <FormLabel>{props.label}</FormLabel>}
					<FormControl>
						<Combobox
							className="w-full"
							contentProps={{
								align: "center",
								className:
									"min-w-[335px] w-fit max-w-[97.5vw] max-h-[47.5vh] overflow-auto",
								placeholder: "Search groups...",
							}}
							placeholder="Select a group..."
							notFoundContent="No groups found."
							data={
								props.parents.map((group) => ({
									label: (
										<span className="flex items-baseline gap-2">
											{group.name}{" "}
										</span>
									),
									description: (
										<TypographyMuted className="text-xs">
											{group.extraInfo}
										</TypographyMuted>
									),
									value: group.id,
									filterValue: group.name,
								})) ?? []
							}
							aria-required
							{...field}
						/>
					</FormControl>
					<FormError />
				</FormItem>
			)}
		/>
	);
}
