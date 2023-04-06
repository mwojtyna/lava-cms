"use client";

import { type DraggableChildrenFn, Droppable } from "@hello-pangea/dnd";
import type { ComponentProps } from "react";

interface Props extends ComponentProps<"div"> {
	droppableId: string;
	renderClone: DraggableChildrenFn | null;
}
export default function DropZone(props: Props) {
	const { droppableId, renderClone, ...rest } = props;

	return (
		<Droppable
			droppableId={props.droppableId}
			isCombineEnabled={true}
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
