"use client";

import { ArrowUturnLeftIcon, CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import * as React from "react";
import { cn } from "@/src/utils/styling";
import { ActionIcon } from "./ui/client/ActionIcon";
import { Button } from "./ui/client/Button";
import {
	Command,
	CommandInput,
	CommandEmpty,
	CommandItem,
	CommandLoading,
	CommandList,
} from "./ui/client/Command";
import { FormControl } from "./ui/client/Form";
import { PopoverContent, Popover, PopoverTrigger } from "./ui/client/Popover";
import { Loader } from "./ui/server/Loader";

const getRestorableComboboxProps = (edited: boolean, restore: () => void) => ({
	className: cn(edited && "ring-2 ring-brand ring-offset-2 ring-offset-black"),
	restoreButton: edited ? (
		<ActionIcon variant={"simple"} onClick={restore} tooltip="Restore">
			<ArrowUturnLeftIcon className="w-5" />
		</ActionIcon>
	) : null,
});

type ComboboxData = {
	value: string;
	label: React.ReactNode;
	description?: React.ReactNode;
	filterValue: string;
};
type ContentProps = { placeholder?: string } & React.ComponentPropsWithoutRef<
	typeof PopoverContent
>;
interface ComboboxProps extends Omit<React.ComponentPropsWithoutRef<typeof Button>, "onChange"> {
	data: ComboboxData[];
	contentProps?: ContentProps;
	placeholder?: React.ReactNode;
	notFoundContent: React.ReactNode;
	deselectable?: boolean;
	loading?: boolean;

	// react-hook-form props
	value?: string;
	// Can't figure out how to type this
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onChange?: (value: any) => void;
}
const Combobox = React.forwardRef<React.ComponentRef<typeof Button>, ComboboxProps>(
	(
		{
			data,
			className,
			contentProps,
			placeholder,
			notFoundContent,
			deselectable,
			loading,
			value,
			onChange,
			...props
		},
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
						{!loading && <CommandEmpty>{notFoundContent}</CommandEmpty>}
						<CommandList>
							{loading && (
								<div className="flex justify-center py-2 text-sm text-muted-foreground">
									<CommandLoading>
										Loading <Loader />
									</CommandLoading>
								</div>
							)}

							{data.map((item, i) => {
								if (
									!item.filterValue.toLowerCase().includes(search.toLowerCase())
								) {
									return null;
								}

								return (
									<CommandItem
										key={i}
										value={item.value}
										onSelect={() => {
											// We don't use the provided value from onSelect because it's automatically
											// inferred from the textContent of <CommandItem> and not the value prop
											// for some stupid reason
											onChange?.(
												deselectable
													? item.value === value
														? ""
														: item.value
													: item.value,
											);
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
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		);
	},
);
Combobox.displayName = "Combobox";

export { Combobox, type ComboboxData, getRestorableComboboxProps };
