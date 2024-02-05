"use client";

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";
import { ELEMENT_BLOCKQUOTE } from "@udecode/plate-block-quote";
import { ELEMENT_CODE_BLOCK } from "@udecode/plate-code-block";
import { focusEditor, insertEmptyElement, useEditorRef } from "@udecode/plate-common";
import { ELEMENT_H1, ELEMENT_H2, ELEMENT_H3 } from "@udecode/plate-heading";
import { ELEMENT_PARAGRAPH } from "@udecode/plate-paragraph";
import React from "react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	useOpenState,
} from "@/src/components/ui/client";
import { icons } from "./icons";
import { ToolbarButton } from "./Toolbar";

const items = [
	{
		label: "Basic blocks",
		items: [
			{
				value: ELEMENT_PARAGRAPH,
				label: "Paragraph",
				description: "Paragraph",
				icon: icons.Paragraph,
			},
			{
				value: ELEMENT_H1,
				label: "Heading 1",
				description: "Heading 1",
				icon: icons.H1,
			},
			{
				value: ELEMENT_H2,
				label: "Heading 2",
				description: "Heading 2",
				icon: icons.H2,
			},
			{
				value: ELEMENT_H3,
				label: "Heading 3",
				description: "Heading 3",
				icon: icons.H3,
			},
			{
				value: ELEMENT_BLOCKQUOTE,
				label: "Quote",
				description: "Quote (⌘+⇧+.)",
				icon: icons.BlockQuote,
			},
			// {
			//   value: ELEMENT_TABLE,
			//   label: 'Table',
			//   description: 'Table',
			//   icon: Icons.table,
			// },
			{
				value: "ul",
				label: "Bulleted list",
				description: "Bulleted list",
				icon: icons.Ul,
			},
			{
				value: "ol",
				label: "Numbered list",
				description: "Numbered list",
				icon: icons.Ol,
			},
			// {
			//   value: ELEMENT_HR,
			//   label: 'Divider',
			//   description: 'Divider (---)',
			//   icon: Icons.hr,
			// },
		],
	},
	{
		label: "Media",
		items: [
			{
				value: ELEMENT_CODE_BLOCK,
				label: "Code",
				description: "Code (```)",
				icon: icons.Code,
			},
		],
	},
	//     {
	//       value: ELEMENT_IMAGE,
	//       label: 'Image',
	//       description: 'Image',
	//       icon: Icons.image,
	//     },
	//     {
	//       value: ELEMENT_MEDIA_EMBED,
	//       label: 'Embed',
	//       description: 'Embed',
	//       icon: Icons.embed,
	//     },
	//     {
	//       value: ELEMENT_EXCALIDRAW,
	//       label: 'Excalidraw',
	//       description: 'Excalidraw',
	//       icon: Icons.excalidraw,
	//     },
	//   ],
	// },
];

export function InsertDropdownMenu(props: DropdownMenuProps) {
	const editor = useEditorRef();
	const openState = useOpenState();

	return (
		<DropdownMenu modal={false} {...openState} {...props}>
			<DropdownMenuTrigger asChild>
				<ToolbarButton pressed={openState.open} tooltip="Insert" isDropdown>
					<icons.Plus />
				</ToolbarButton>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="start"
				className="flex max-h-[500px] min-w-0 flex-col gap-0.5 overflow-y-auto"
			>
				{items.map(({ items: nestedItems, label }, index) => (
					<React.Fragment key={label}>
						{index !== 0 && <DropdownMenuSeparator />}

						<DropdownMenuLabel>{label}</DropdownMenuLabel>
						{nestedItems.map(({ value: type, label: itemLabel, icon: Icon }) => (
							<DropdownMenuItem
								key={type}
								className="min-w-[180px]"
								onSelect={() => {
									switch (type) {
										// case ELEMENT_CODE_BLOCK: {
										//   insertEmptyCodeBlock(editor);
										//
										//   break;
										// }
										// case ELEMENT_IMAGE: {
										//   await insertMedia(editor, { type: ELEMENT_IMAGE });
										//
										//   break;
										// }
										// case ELEMENT_MEDIA_EMBED: {
										//   await insertMedia(editor, {
										//     type: ELEMENT_MEDIA_EMBED,
										//   });
										//
										//   break;
										// }
										// case 'ul':
										// case 'ol': {
										//   insertEmptyElement(editor, ELEMENT_PARAGRAPH, {
										//     select: true,
										//     nextBlock: true,
										//   });
										//
										//   if (settingsStore.get.checkedId(KEY_LIST_STYLE_TYPE)) {
										//     toggleIndentList(editor, {
										//       listStyleType: type === 'ul' ? 'disc' : 'decimal',
										//     });
										//   } else if (settingsStore.get.checkedId('list')) {
										//     toggleList(editor, { type });
										//   }
										//
										//   break;
										// }
										// case ELEMENT_TABLE: {
										//   insertTable(editor);
										//
										//   break;
										// }
										// case ELEMENT_LINK: {
										//   triggerFloatingLink(editor, { focused: true });
										//
										//   break;
										// }
										default: {
											insertEmptyElement(editor, type, {
												select: true,
												nextBlock: true,
											});
										}
									}

									focusEditor(editor);
								}}
							>
								<Icon className="mr-2 h-5 w-5" />
								{itemLabel}
							</DropdownMenuItem>
						))}
					</React.Fragment>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
