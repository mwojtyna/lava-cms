"use client";

import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Group } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { Section } from "@admin/app/dashboard/(components)/Section";
import { trpcReact } from "@admin/src/utils/trpcReact";
import type { Page } from "api/prisma/types";

export default function PageList({ pages }: { pages: Page[] }) {
	const data = trpcReact.pages.getPages.useQuery().data ?? pages;
	const [state, handlers] = useListState(data);

	const items = state.map((item, index) => (
		<Draggable key={item.id} index={index} draggableId={item.id}>
			{(provided) => (
				<div
					// className={cx(classes.item, { [classes.itemDragging]: snapshot.isDragging })}
					ref={provided.innerRef}
					{...provided.draggableProps}
				>
					<Group>
						<div className="bg-red-600" {...provided.dragHandleProps}>
							<EllipsisVerticalIcon className="w-4" />
						</div>
						<pre>{JSON.stringify(item, null, 2)}</pre>
					</Group>
				</div>
			)}
		</Draggable>
	));

	return (
		<Section>
			<Section.Title>Structure</Section.Title>
			<DragDropContext
				onDragEnd={({ destination, source }) =>
					handlers.reorder({ from: source.index, to: destination?.index ?? source.index })
				}
			>
				<Droppable droppableId="dnd-list" direction="vertical">
					{(provided) => (
						<div {...provided.droppableProps} ref={provided.innerRef}>
							{items}
							{provided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>
		</Section>
	);
}
