"use client";

import { type DraggableChildrenFn, Droppable } from "@hello-pangea/dnd";
import type { ComponentProps } from "react";

interface Props extends ComponentProps<"div"> {
	droppableId: string;
	disabled?: boolean;
	renderClone: DraggableChildrenFn | null;
}
export default function DropZone(props: Props) {
	const { droppableId, disabled, renderClone, ...rest } = props;

	return (
		<Droppable
			droppableId={props.droppableId}
			isDropDisabled={disabled}
			renderClone={renderClone}
		>
			{(provided) => (
				<div {...provided.droppableProps} ref={provided.innerRef} {...rest}>
					{props.children}
					{provided.placeholder}
				</div>
			)}
		</Droppable>
	);
}
