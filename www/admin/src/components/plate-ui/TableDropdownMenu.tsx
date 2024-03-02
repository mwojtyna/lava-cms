import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";
import { focusEditor, someNode, useEditorRef, useEditorSelector } from "@udecode/plate-common";
import {
	deleteColumn,
	deleteRow,
	deleteTable,
	ELEMENT_TABLE,
	insertTable,
	insertTableColumn,
	insertTableRow,
} from "@udecode/plate-table";
import React from "react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
	useOpenState,
} from "@/src/components/ui/client/DropdownMenu";
import { icons } from "./icons";
import { ToolbarButton } from "./Toolbar";

export function TableDropdownMenu(props: DropdownMenuProps) {
	const tableSelected = useEditorSelector(
		(editor) => someNode(editor, { match: { type: ELEMENT_TABLE } }),
		[],
	);

	const editor = useEditorRef();
	const openState = useOpenState();

	return (
		<DropdownMenu modal={false} {...openState} {...props}>
			<DropdownMenuTrigger asChild>
				<ToolbarButton pressed={openState.open} tooltip="Table" isDropdown>
					<icons.Table />
				</ToolbarButton>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="start" className="flex w-[180px] min-w-0 flex-col gap-0.5">
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<icons.Table className="h-5 w-5" />
						<span>Table</span>
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuItem
							className="min-w-[180px]"
							onSelect={() => {
								insertTable(editor);
								focusEditor(editor);
							}}
						>
							<icons.Plus className="h-5 w-5" />
							Insert table
						</DropdownMenuItem>
						<DropdownMenuItem
							className="min-w-[180px]"
							disabled={!tableSelected}
							onSelect={() => {
								deleteTable(editor);
								focusEditor(editor);
							}}
						>
							<icons.Delete className="h-5 w-5" />
							Delete table
						</DropdownMenuItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>

				<DropdownMenuSub>
					<DropdownMenuSubTrigger disabled={!tableSelected}>
						<icons.Column className="h-5 w-5" />
						<span>Column</span>
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuItem
							className="min-w-[180px]"
							disabled={!tableSelected}
							onSelect={() => {
								insertTableColumn(editor);
								focusEditor(editor);
							}}
						>
							<icons.Plus className="h-5 w-5" />
							Insert column after
						</DropdownMenuItem>
						<DropdownMenuItem
							className="min-w-[180px]"
							disabled={!tableSelected}
							onSelect={() => {
								deleteColumn(editor);
								focusEditor(editor);
							}}
						>
							<icons.Minus className="h-5 w-5" />
							Delete column
						</DropdownMenuItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>

				<DropdownMenuSub>
					<DropdownMenuSubTrigger disabled={!tableSelected}>
						<icons.Row className="h-5 w-5" />
						<span>Row</span>
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuItem
							className="min-w-[180px]"
							disabled={!tableSelected}
							onSelect={() => {
								insertTableRow(editor);
								focusEditor(editor);
							}}
						>
							<icons.Plus className="h-5 w-5" />
							Insert row after
						</DropdownMenuItem>
						<DropdownMenuItem
							className="min-w-[180px]"
							disabled={!tableSelected}
							onSelect={() => {
								deleteRow(editor);
								focusEditor(editor);
							}}
						>
							<icons.Minus className="h-5 w-5" />
							Delete row
						</DropdownMenuItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
