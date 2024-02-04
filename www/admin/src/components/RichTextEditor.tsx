"use client";

import type { FormFieldProps } from "./ui/client";
import { Plate, type Value } from "@udecode/plate-common";
import React from "react";
import { Editor } from "./plate-ui";

interface Props extends FormFieldProps<Value> {
	//
}

export function RichTextEditor(props: Props) {
	return (
		<Plate value={props.value} onChange={props.onChange}>
			<Editor />
		</Plate>
	);
}
