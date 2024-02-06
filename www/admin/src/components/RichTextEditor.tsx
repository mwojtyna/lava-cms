"use client";

import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { withProps } from "@udecode/cn";
import { createAlignPlugin } from "@udecode/plate-alignment";
import { createBasicElementsPlugin } from "@udecode/plate-basic-elements";
import {
	MARK_BOLD,
	MARK_CODE,
	MARK_ITALIC,
	MARK_STRIKETHROUGH,
	MARK_SUBSCRIPT,
	MARK_SUPERSCRIPT,
	MARK_UNDERLINE,
	createBasicMarksPlugin,
} from "@udecode/plate-basic-marks";
import { ELEMENT_BLOCKQUOTE } from "@udecode/plate-block-quote";
import { createSoftBreakPlugin } from "@udecode/plate-break";
import { createCaptionPlugin } from "@udecode/plate-caption";
import { ELEMENT_CODE_BLOCK } from "@udecode/plate-code-block";
import {
	Plate,
	createPlugins,
	type Value,
	PlateLeaf,
	type RenderAfterEditable,
} from "@udecode/plate-common";
import { isSelectionAtBlockStart } from "@udecode/plate-common";
import {
	ELEMENT_H1,
	ELEMENT_H2,
	ELEMENT_H3,
	ELEMENT_H4,
	ELEMENT_H5,
	ELEMENT_H6,
} from "@udecode/plate-heading";
import { createIndentPlugin } from "@udecode/plate-indent";
import { createIndentListPlugin } from "@udecode/plate-indent-list";
import { createLineHeightPlugin } from "@udecode/plate-line-height";
import { ELEMENT_LINK, createLinkPlugin } from "@udecode/plate-link";
import { ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED, createImagePlugin } from "@udecode/plate-media";
import { ELEMENT_PARAGRAPH } from "@udecode/plate-paragraph";
import { createResetNodePlugin } from "@udecode/plate-reset-node";
import { createDeserializeMdPlugin } from "@udecode/plate-serializer-md";
import {
	ELEMENT_TABLE,
	ELEMENT_TD,
	ELEMENT_TH,
	ELEMENT_TR,
	createTablePlugin,
} from "@udecode/plate-table";
import React from "react";
import { cn } from "../utils/styling";
import {
	Editor,
	BlockquoteElement,
	HeadingElement,
	ParagraphElement,
	CodeBlockElement,
	FixedToolbar,
	FixedToolbarButtons,
	CodeLeaf,
	LinkElement,
	LinkFloatingToolbar,
	MediaEmbedElement,
	ImageElement,
	TableElement,
	TableRowElement,
	TableCellElement,
	TableCellHeaderElement,
} from "./plate-ui";
import { ActionIcon, type FormFieldProps } from "./ui/client";

const resetBlockTypesCommonRule = {
	types: [
		ELEMENT_H1,
		ELEMENT_H2,
		ELEMENT_H3,
		ELEMENT_H4,
		ELEMENT_H5,
		ELEMENT_H6,
		ELEMENT_BLOCKQUOTE,
	],
	defaultType: ELEMENT_PARAGRAPH,
};

export const plugins = createPlugins(
	[
		createBasicElementsPlugin(),
		createBasicMarksPlugin(),
		createAlignPlugin({
			inject: {
				props: {
					validTypes: [
						ELEMENT_H1,
						ELEMENT_H2,
						ELEMENT_H3,
						ELEMENT_H4,
						ELEMENT_H5,
						ELEMENT_H6,
						ELEMENT_PARAGRAPH,
						ELEMENT_BLOCKQUOTE,
						ELEMENT_IMAGE,
					],
				},
			},
		}),
		createLineHeightPlugin({
			inject: {
				props: {
					defaultNodeValue: 1.5,
					validNodeValues: [1, 1.2, 1.5, 2, 3],
					validTypes: [ELEMENT_PARAGRAPH, ELEMENT_H1, ELEMENT_H2, ELEMENT_H3],
				},
			},
		}),
		createIndentPlugin({
			inject: {
				props: {
					validTypes: [
						ELEMENT_PARAGRAPH,
						ELEMENT_H1,
						ELEMENT_H2,
						ELEMENT_H3,
						ELEMENT_BLOCKQUOTE,
						// ELEMENT_CODE_BLOCK,
					],
				},
			},
		}),
		createIndentListPlugin({
			inject: {
				props: {
					validTypes: [
						ELEMENT_PARAGRAPH,
						ELEMENT_H1,
						ELEMENT_H2,
						ELEMENT_H3,
						ELEMENT_BLOCKQUOTE,
						// ELEMENT_CODE_BLOCK,
					],
				},
			},
		}),
		createLinkPlugin({
			renderAfterEditable: LinkFloatingToolbar as RenderAfterEditable,
		}),
		createSoftBreakPlugin({
			options: {
				rules: [
					{ hotkey: "shift+enter" },
					{
						hotkey: "enter",
						query: {
							allow: [/* ELEMENT_CODE_BLOCK, */ ELEMENT_BLOCKQUOTE /* ,ELEMENT_TD */],
						},
					},
				],
			},
		}),
		createResetNodePlugin({
			options: {
				rules: [
					{
						...resetBlockTypesCommonRule,
						hotkey: "Backspace",
						predicate: isSelectionAtBlockStart,
					},
				],
			},
		}),
		createImagePlugin({
			serializeHtml: ({ element, className }) => {
				const caption = element.caption as Array<{ text: string }>;
				const align = element.align as "left" | "center" | "right" | "justify";

				let justifyContent = "";
				if (align === "left") {
					justifyContent = "flex-start";
				} else if (align === "center") {
					justifyContent = "center";
				} else if (align === "right") {
					justifyContent = "flex-end";
				}

				return (
					<div
						style={{
							width: "100%",
							display: "flex",
							justifyContent,
						}}
					>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							className={className}
							src={element.url as string}
							alt={caption[0]?.text}
						/>
					</div>
				);
			},
		}),
		createCaptionPlugin({
			options: {
				pluginKeys: [ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED],
			},
		}),
		createDeserializeMdPlugin(),
		createTablePlugin({
			options: {
				enableMerging: true,
			},
		}),
	],
	{
		// FIX: When just added a component with rich text field and saved, the content is empty
		// TODO: Own codeblock element, table, divider, dnd
		components: {
			// createBasicElementsPlugin()
			[ELEMENT_H1]: withProps(HeadingElement, { variant: "h1" }),
			[ELEMENT_H2]: withProps(HeadingElement, { variant: "h2" }),
			[ELEMENT_H3]: withProps(HeadingElement, { variant: "h3" }),
			[ELEMENT_H4]: withProps(HeadingElement, { variant: "h4" }),
			[ELEMENT_H5]: withProps(HeadingElement, { variant: "h5" }),
			[ELEMENT_H6]: withProps(HeadingElement, { variant: "h6" }),
			[ELEMENT_PARAGRAPH]: ParagraphElement,
			[ELEMENT_BLOCKQUOTE]: BlockquoteElement,
			[ELEMENT_CODE_BLOCK]: CodeBlockElement,

			// createBasicMarksPlugin()
			[MARK_BOLD]: withProps(PlateLeaf, { as: "strong" }),
			[MARK_ITALIC]: withProps(PlateLeaf, { as: "em" }),
			[MARK_UNDERLINE]: withProps(PlateLeaf, { as: "u" }),
			[MARK_STRIKETHROUGH]: withProps(PlateLeaf, { as: "s" }),
			[MARK_CODE]: CodeLeaf,

			[ELEMENT_LINK]: LinkElement,
			[MARK_SUPERSCRIPT]: withProps(PlateLeaf, { as: "sup" }),
			[MARK_SUBSCRIPT]: withProps(PlateLeaf, { as: "sub" }),

			[ELEMENT_IMAGE]: ImageElement,
			[ELEMENT_MEDIA_EMBED]: MediaEmbedElement,

			[ELEMENT_TABLE]: TableElement,
			[ELEMENT_TR]: TableRowElement,
			[ELEMENT_TD]: TableCellElement,
			[ELEMENT_TH]: TableCellHeaderElement,
		},
	},
);

interface Props extends FormFieldProps<Value> {
	edited: boolean;
	onRestore: () => void;
}
export function RichTextEditor(props: Props) {
	return (
		<Plate plugins={plugins} value={props.value} onChange={props.onChange}>
			<div
				className={cn(
					// Block selection
					"[&_.slate-start-area-left]:!w-[64px] [&_.slate-start-area-right]:!w-[64px] [&_.slate-start-area-top]:!h-4",
					"relative rounded-md ring-ring ring-offset-2 ring-offset-card focus-within:ring-2",
				)}
			>
				<FixedToolbar>
					<FixedToolbarButtons />
				</FixedToolbar>

				<Editor
					className={cn("rounded-t-none border-t-0", props.edited && "border-b-brand")}
					focusRing={false}
				/>

				{props.edited && (
					<ActionIcon
						className="absolute bottom-1 right-1 bg-background/50"
						onClick={props.onRestore}
						tooltip={"Restore"}
					>
						<ArrowUturnLeftIcon className="w-4" />
					</ActionIcon>
				)}
			</div>
		</Plate>
	);
}
