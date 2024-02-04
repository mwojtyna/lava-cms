"use client";

import type { FormFieldProps } from "./ui/client";
import { withProps } from "@udecode/cn";
import { createBasicElementsPlugin } from "@udecode/plate-basic-elements";
import {
	MARK_BOLD,
	MARK_CODE,
	MARK_ITALIC,
	MARK_STRIKETHROUGH,
	MARK_UNDERLINE,
	createBasicMarksPlugin,
} from "@udecode/plate-basic-marks";
import { ELEMENT_BLOCKQUOTE } from "@udecode/plate-block-quote";
import { ELEMENT_CODE_BLOCK } from "@udecode/plate-code-block";
import { Plate, createPlugins, type Value, PlateLeaf } from "@udecode/plate-common";
import {
	ELEMENT_H1,
	ELEMENT_H2,
	ELEMENT_H3,
	ELEMENT_H4,
	ELEMENT_H5,
	ELEMENT_H6,
} from "@udecode/plate-heading";
import { ELEMENT_PARAGRAPH } from "@udecode/plate-paragraph";
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
} from "./plate-ui";

export const plugins = createPlugins([createBasicElementsPlugin(), createBasicMarksPlugin()], {
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
	},
});

export function RichTextEditor(props: FormFieldProps<Value>) {
	return (
		<Plate plugins={plugins} value={props.value} onChange={props.onChange}>
			<div
				className={cn(
					// Block selection
					"[&_.slate-start-area-left]:!w-[64px] [&_.slate-start-area-right]:!w-[64px] [&_.slate-start-area-top]:!h-4",
					"rounded-md ring-ring ring-offset-2 ring-offset-card focus-within:ring-2",
				)}
			>
				<FixedToolbar>
					<FixedToolbarButtons />
				</FixedToolbar>

				<Editor className="rounded-t-none border-t-0" focusRing={false} />
			</div>
		</Plate>
	);
}
