"use client";

import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import * as React from "react";
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
import { cn } from "@admin/src/utils/styling";

type ComboboxData = Array<{
	value: string;
	label: React.ReactNode;
	description: React.ReactNode;
	filterValue: string;
}>;
interface ComboboxProps extends Omit<React.ComponentPropsWithoutRef<typeof Button>, "onChange"> {
	data: ComboboxData;
	contentProps?: React.ComponentPropsWithoutRef<typeof PopoverContent>;
	notFoundContent: React.ReactNode;

	// react-hook-form props
	value?: string;
	// Can't figure out how to type this
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onChange?: (value: any) => void;
}
const Combobox = React.forwardRef<React.ComponentRef<typeof Button>, ComboboxProps>(
	(
		{ data, className, contentProps, placeholder, notFoundContent, value, onChange, ...props },
		ref,
	) => {
		const [open, setOpen] = React.useState(false);
		const [search, setSearch] = React.useState("");

		return (
			<Popover open={open} onOpenChange={setOpen} modal={true}>
				<PopoverTrigger asChild>
					<FormControl>
						<Button
							ref={ref}
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className={cn(
								"justify-between overflow-hidden px-3 text-left active:translate-y-0",
								className,
							)}
							{...props}
						>
							{value ? (
								data.find((item) => item.value === value)?.label
							) : (
								<span className="font-normal text-muted-foreground">
									{placeholder}
								</span>
							)}
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
										onSelect={() => {
											// We don't use the provided value from onSelect because it's automatically
											// inferred from the textContent of <CommandItem> and not the value prop
											// for some stupid reason
											onChange?.(item.value === value ? "" : item.value);
											setOpen(false);
										}}
									>
										<CheckIcon
											className={cn(
												"mr-2 h-4 w-4",
												value === item.value ? "visible" : "invisible",
											)}
										/>
										<div>
											{item.label}
											{item.description}
										</div>
									</CommandItem>
								);
							})}
						</CommandGroup>
					</Command>
				</PopoverContent>
			</Popover>
		);
	},
);
Combobox.displayName = "Combobox";

export { Combobox, type ComboboxData };
