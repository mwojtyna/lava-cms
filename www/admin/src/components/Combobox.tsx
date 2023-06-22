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
	FormControl,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@admin/src/components/ui/client";

type ComboboxData = { value: string; label: React.ReactNode; filterValue: string }[];
interface ComboboxProps extends Omit<React.ComponentPropsWithoutRef<typeof Button>, "onChange"> {
	data: ComboboxData;
	contentProps?: React.ComponentPropsWithoutRef<typeof PopoverContent>;
	notFoundContent?: React.ReactNode;
	value: string;
	// Can't figure out how to type this
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onChange: (value: any) => void;
}
const Combobox = React.forwardRef<React.ComponentRef<typeof Button>, ComboboxProps>(
	(
		{ data, className, contentProps, placeholder, notFoundContent, value, onChange, ...props },
		ref
	) => {
		const [open, setOpen] = React.useState(false);
		const [search, setSearch] = React.useState("");

		return (
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<FormControl>
						<Button
							ref={ref}
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className={cn(
								"w-[200px] justify-between active:translate-y-0",
								className
							)}
							{...props}
						>
							{value ? data.find((item) => item.value === value)?.label : placeholder}
							<ChevronUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</FormControl>
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
						<CommandEmpty>{notFoundContent}</CommandEmpty>
						<CommandGroup>
							{data.map((item, i) => {
								if (!item.filterValue.toLowerCase().includes(search.toLowerCase()))
									return null;

								return (
									<CommandItem
										key={i}
										value={item.value}
										onSelect={(currentValue) => {
											onChange(currentValue === value ? "" : currentValue);
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
);
Combobox.displayName = "Combobox";

export { Combobox, type ComboboxData };
