"use client";

import { Droppable } from "@hello-pangea/dnd";
import type { ComponentProps } from "react";

interface Props extends ComponentProps<"div"> {
	droppableId: string;
	disabled?: boolean;
}
export default function DropZone(props: Props) {
	const { droppableId, disabled, ...rest } = props;

	return (
		<Droppable droppableId={props.droppableId} isDropDisabled={disabled}>
			{(provided) => {
				return (
					<div {...provided.droppableProps} ref={provided.innerRef} {...rest}>
						{props.children}
						{provided.placeholder}
					</div>
				);
			}}
		</Droppable>
	);
}
