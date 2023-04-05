"use client";

import { Droppable } from "@hello-pangea/dnd";
import type { ComponentProps } from "react";

interface Props extends ComponentProps<"div"> {
	droppableId: string;
}
export default function Drop(props: Props) {
	const { droppableId, ...rest } = props;

	return (
		<Droppable droppableId={props.droppableId}>
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
