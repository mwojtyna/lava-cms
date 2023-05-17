"use client";

import * as React from "react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { cn } from "@admin/src/utils/styling";
import {
	Button,
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@admin/src/components/ui/client";

type ComboboxData = { value: string; label: React.ReactNode; filterValue: string }[];
interface ComboboxProps extends React.ComponentPropsWithoutRef<typeof Button> {
	data: ComboboxData;
	contentProps?: React.ComponentPropsWithoutRef<typeof PopoverContent>;
	onValueChange?: (value: string) => void;
}
function Combobox({
	data,
	className,
	contentProps,
	onValueChange,
	placeholder,
	...props
}: ComboboxProps) {
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState("");
	const [search, setSearch] = React.useState("");

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn("w-[200px] justify-between active:translate-y-0", className)}
					{...props}
				>
					{value ? data.find((item) => item.value === value)?.label : placeholder}
					<ChevronUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>

			<PopoverContent
				{...contentProps}
				className={cn("w-full !p-0", contentProps?.className)}
			>
				<Command shouldFilter={false}>
					<CommandInput
						placeholder={contentProps?.placeholder}
						value={search}
						onValueChange={(value) => setSearch(value)}
					/>
					<CommandEmpty>No framework found.</CommandEmpty>
					<CommandGroup>
						{data.map((item, i) => {
							if (!item.filterValue.toLowerCase().includes(search.toLowerCase()))
								return null;

							return (
								<CommandItem
									key={i}
									value={item.value}
									onSelect={(currentValue) => {
										setValue(currentValue === value ? "" : currentValue);
										onValueChange?.(currentValue);
										setOpen(false);
									}}
								>
									<CheckIcon
										className={cn(
											"mr-2 h-4 w-4",
											value === item.value ? "opacity-100" : "opacity-0"
										)}
									/>
									{item.label}
								</CommandItem>
							);
						})}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

export { Combobox, type ComboboxData };
