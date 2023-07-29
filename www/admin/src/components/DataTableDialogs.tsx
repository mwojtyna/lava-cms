import type { Path, UseFormReturn } from "react-hook-form";
import { FormControl, FormError, FormField, FormItem } from "./ui/client";
import { Combobox } from "./Combobox";
import { TypographyMuted } from "./ui/server";

export interface MoveDialogInputs {
	newParentId: string;
}
export interface ItemParent {
	id: string;
	name: string;
	extraInfo: string;
}

interface NewParentSelectProps<T extends MoveDialogInputs> {
	form: UseFormReturn<T>;
	parents: ItemParent[];
}
export function NewParentSelect<T extends MoveDialogInputs>(props: NewParentSelectProps<T>) {
	return (
		<FormField
			control={props.form.control}
			name={"newParentId" as Path<T>}
			render={({ field }) => (
				<FormItem>
					<FormControl>
						<Combobox
							className="w-full"
							contentProps={{
								align: "start",
								className: "w-[335px]",
								placeholder: "Search groups...",
							}}
							placeholder="Select a group..."
							notFoundContent="No groups found."
							data={
								props.parents.map((group) => ({
									label: (
										<span className="flex items-baseline gap-2">
											<span>{group.name}</span>{" "}
											<TypographyMuted className="text-xs">
												{group.extraInfo}
											</TypographyMuted>
										</span>
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
