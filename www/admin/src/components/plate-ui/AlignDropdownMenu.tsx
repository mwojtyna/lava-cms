"use client";

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";
import { useAlignDropdownMenu, useAlignDropdownMenuState } from "@udecode/plate-alignment";
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
import { ToolbarButton } from ".";

const items = [
	{
		value: "left",
		icon: icons.AlignLeft,
	},
	{
		value: "center",
		icon: icons.AlignCenter,
	},
	{
		value: "right",
		icon: icons.AlignRight,
	},
	{
		value: "justify",
		icon: icons.AlignJustify,
	},
];

export function AlignDropdownMenu({ children, ...props }: DropdownMenuProps) {
	const state = useAlignDropdownMenuState();
	const { radioGroupProps } = useAlignDropdownMenu(state);

	const openState = useOpenState();
	const IconValue =
		items.find((item) => item.value === radioGroupProps.value)?.icon ?? icons.AlignLeft;

	return (
		<DropdownMenu modal={false} {...openState} {...props}>
			<DropdownMenuTrigger asChild>
				<ToolbarButton pressed={openState.open} tooltip="Align" isDropdown>
					<IconValue />
				</ToolbarButton>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="start" className="min-w-0">
				<DropdownMenuRadioGroup className="flex flex-col gap-0.5" {...radioGroupProps}>
					{items.map(({ value: itemValue, icon: Icon }) => (
						<DropdownMenuRadioItem key={itemValue} value={itemValue} hideIcon>
							<Icon />
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
