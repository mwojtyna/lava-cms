import { useOs } from "@mantine/hooks";
import {
	MARK_BOLD,
	MARK_CODE,
	MARK_ITALIC,
	MARK_STRIKETHROUGH,
	MARK_UNDERLINE,
} from "@udecode/plate-basic-marks";
import { useEditorReadOnly } from "@udecode/plate-common";
import React from "react";

import { icons } from "./icons";
import {
	InsertDropdownMenu,
	MarkToolbarButton,
	LineHeightDropdownMenu,
	TurnIntoDropdownMenu,
	ToolbarGroup,
	AlignDropdownMenu,
} from "./";

export function FixedToolbarButtons() {
	const readOnly = useEditorReadOnly();
	const os = useOs();
	const modifierKey = os === "macos" ? "⌘" : "Ctrl";

	return (
		<div className="w-full overflow-hidden">
			<div
				className="flex flex-wrap"
				style={{
					transform: "translateX(calc(-1px))",
				}}
			>
				{!readOnly && (
					<>
						<ToolbarGroup noSeparator>
							<InsertDropdownMenu />
							<TurnIntoDropdownMenu />
						</ToolbarGroup>

						<ToolbarGroup noGap>
							<MarkToolbarButton
								tooltip={`Bold (${modifierKey}+B)`}
								nodeType={MARK_BOLD}
							>
								<icons.Bold />
							</MarkToolbarButton>
							<MarkToolbarButton
								tooltip={`Italic (${modifierKey}+I)`}
								nodeType={MARK_ITALIC}
							>
								<icons.Italic />
							</MarkToolbarButton>
							<MarkToolbarButton
								tooltip={`Underline (${modifierKey}+U)`}
								nodeType={MARK_UNDERLINE}
							>
								<icons.Underline />
							</MarkToolbarButton>

							<MarkToolbarButton
								tooltip={`Strikethrough (${modifierKey}+Shift+M)`}
								nodeType={MARK_STRIKETHROUGH}
							>
								<icons.Strikethrough />
							</MarkToolbarButton>
							<MarkToolbarButton
								tooltip={`Code (${modifierKey}+E)`}
								nodeType={MARK_CODE}
							>
								<icons.Code />
							</MarkToolbarButton>
						</ToolbarGroup>

						<ToolbarGroup noGap>
							<AlignDropdownMenu />
							<LineHeightDropdownMenu />
						</ToolbarGroup>
					</>
				)}
			</div>
		</div>
	);
}
