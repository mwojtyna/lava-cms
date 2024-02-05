import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";
import {
	useLineHeightDropdownMenu,
	useLineHeightDropdownMenuState,
} from "@udecode/plate-line-height";
import React from "react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
	useOpenState,
} from "@/src/components/ui/client";
import { icons } from "./icons";
import { ToolbarButton } from "./";

export function LineHeightDropdownMenu({ ...props }: DropdownMenuProps) {
	const openState = useOpenState();
	const state = useLineHeightDropdownMenuState();
	const { radioGroupProps } = useLineHeightDropdownMenu(state);

	return (
		<DropdownMenu modal={false} {...openState} {...props}>
			<DropdownMenuTrigger asChild>
				<ToolbarButton pressed={openState.open} tooltip="Line height" isDropdown>
					<icons.LineHeight />
				</ToolbarButton>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="start" className="min-w-0">
				<DropdownMenuRadioGroup className="flex flex-col gap-0.5" {...radioGroupProps}>
					{state.values.map((_value) => (
						<DropdownMenuRadioItem
							// Shitty types
							// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
							key={_value}
							// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
							value={_value}
							className="min-w-[180px]"
						>
							{_value}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
