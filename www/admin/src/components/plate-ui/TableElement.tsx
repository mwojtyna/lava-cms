import type { TTableElement } from "@udecode/plate-table";
import { cn, withRef } from "@udecode/cn";
import {
	isSelectionExpanded,
	PlateElement,
	useEditorRef,
	useEditorSelector,
	useElement,
	useRemoveNodeButton,
	withHOC,
} from "@udecode/plate-common";
import {
	mergeTableCells,
	TableProvider,
	unmergeTableCells,
	useTableBordersDropdownMenuContentState,
	useTableElement,
	useTableElementState,
	useTableMergeState,
} from "@udecode/plate-table";
import React from "react";
import { useReadOnly, useSelected } from "slate-react";
import { Button } from "../ui/client/Button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/client/DropdownMenu";
import { Popover, PopoverAnchor, PopoverContent, popoverVariants } from "../ui/client/Popover";

import { icons } from "./icons";

export const TableBordersDropdownMenuContent = withRef<typeof DropdownMenuContent>((props, ref) => {
	const {
		getOnSelectTableBorder,
		hasOuterBorders,
		hasBottomBorder,
		hasLeftBorder,
		hasNoBorders,
		hasRightBorder,
		hasTopBorder,
	} = useTableBordersDropdownMenuContentState();

	return (
		<DropdownMenuContent
			ref={ref}
			className={cn("min-w-[220px]")}
			side="right"
			align="start"
			sideOffset={0}
			{...props}
		>
			<DropdownMenuCheckboxItem
				checked={hasBottomBorder}
				onCheckedChange={getOnSelectTableBorder("bottom")}
			>
				<icons.BorderBottom />
				<div>Bottom Border</div>
			</DropdownMenuCheckboxItem>
			<DropdownMenuCheckboxItem
				checked={hasTopBorder}
				onCheckedChange={getOnSelectTableBorder("top")}
			>
				<icons.BorderTop />
				<div>Top Border</div>
			</DropdownMenuCheckboxItem>
			<DropdownMenuCheckboxItem
				checked={hasLeftBorder}
				onCheckedChange={getOnSelectTableBorder("left")}
			>
				<icons.BorderLeft />
				<div>Left Border</div>
			</DropdownMenuCheckboxItem>
			<DropdownMenuCheckboxItem
				checked={hasRightBorder}
				onCheckedChange={getOnSelectTableBorder("right")}
			>
				<icons.BorderRight />
				<div>Right Border</div>
			</DropdownMenuCheckboxItem>

			<DropdownMenuSeparator />

			<DropdownMenuCheckboxItem
				checked={hasNoBorders}
				onCheckedChange={getOnSelectTableBorder("none")}
			>
				<icons.BorderNone />
				<div>No Border</div>
			</DropdownMenuCheckboxItem>
			<DropdownMenuCheckboxItem
				checked={hasOuterBorders}
				onCheckedChange={getOnSelectTableBorder("outer")}
			>
				<icons.BorderAll />
				<div>Outside Borders</div>
			</DropdownMenuCheckboxItem>
		</DropdownMenuContent>
	);
});

export const TableFloatingToolbar = withRef<typeof PopoverContent>(
	({ children, ...props }, ref) => {
		const element = useElement<TTableElement>();
		const { props: buttonProps } = useRemoveNodeButton({ element });

		const selectionCollapsed = useEditorSelector((editor) => !isSelectionExpanded(editor), []);

		const readOnly = useReadOnly();
		const selected = useSelected();
		const editor = useEditorRef();

		const collapsed = !readOnly && selected && selectionCollapsed;
		const open = !readOnly && selected;

		const { canMerge, canUnmerge } = useTableMergeState();

		const mergeContent = canMerge && (
			<Button contentEditable={false} variant="ghost" onClick={() => mergeTableCells(editor)}>
				<icons.Combine className="h-5 w-5" />
				Merge
			</Button>
		);

		const unmergeButton = canUnmerge && (
			<Button
				contentEditable={false}
				variant="ghost"
				onClick={() => unmergeTableCells(editor)}
			>
				<icons.Ungroup className="mr-2 h-4 w-4" />
				Unmerge
			</Button>
		);

		const bordersContent = collapsed && (
			<>
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="justify-start">
							<icons.BorderAll className="h-5 w-5" />
							Borders
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuPortal>
						<TableBordersDropdownMenuContent />
					</DropdownMenuPortal>
				</DropdownMenu>

				<Button
					contentEditable={false}
					variant="ghost"
					className="w-full justify-start"
					{...buttonProps}
				>
					<icons.Delete className="h-5 w-5" />
					Delete
				</Button>
			</>
		);

		return (
			<Popover open={open} modal={false}>
				<PopoverAnchor asChild>{children}</PopoverAnchor>
				{(canMerge || canUnmerge || collapsed) && (
					<PopoverContent
						ref={ref}
						className={cn(
							popoverVariants(),
							"flex w-fit flex-col items-start gap-1 !p-1",
						)}
						onOpenAutoFocus={(e) => e.preventDefault()}
						{...props}
					>
						{unmergeButton}
						{mergeContent}
						{bordersContent}
					</PopoverContent>
				)}
			</Popover>
		);
	},
);

export const TableElement = withHOC(
	TableProvider,
	withRef<typeof PlateElement>(({ className, children, ...props }, ref) => {
		const { colSizes, isSelectingCell, minColumnWidth, marginLeft } = useTableElementState();
		const { props: tableProps, colGroupProps } = useTableElement();

		return (
			<TableFloatingToolbar>
				<div style={{ paddingLeft: marginLeft }}>
					<PlateElement
						ref={ref}
						asChild
						className={cn(
							"my-4 ml-px mr-0 table h-px w-full table-fixed border-collapse",
							isSelectingCell && "[&_*::selection]:bg-none",
							className,
						)}
						{...tableProps}
						{...props}
					>
						<table>
							<colgroup {...colGroupProps}>
								{colSizes.map((width, index) => (
									<col
										key={index}
										style={{
											minWidth: minColumnWidth,
											width: width || undefined,
										}}
									/>
								))}
							</colgroup>

							<tbody className="min-w-full">{children}</tbody>
						</table>
					</PlateElement>
				</div>
			</TableFloatingToolbar>
		);
	}),
);
