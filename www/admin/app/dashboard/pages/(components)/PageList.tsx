"use client";

import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Card, Center, Group, Stack, Text, Title } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { DocumentIcon } from "@heroicons/react/24/solid";
import { Section } from "@admin/app/dashboard/(components)/Section";
import { trpcReact } from "@admin/src/utils/trpcReact";
import type { Page } from "api/prisma/types";
import { getHoverColor } from "@admin/src/utils/colors";

function GripIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			className="w-5"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			strokeWidth="2"
			stroke="currentColor"
			fill="none"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
			<path d="M9 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
			<path d="M9 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
			<path d="M9 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
			<path d="M15 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
			<path d="M15 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
			<path d="M15 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
		</svg>
	);
}

export default function PageList({ pages }: { pages: Page[] }) {
	const data = trpcReact.pages.getPages.useQuery().data ?? pages;
	const [state, handlers] = useListState(data);

	const items = state.map((item, index) => (
		<Draggable key={item.id} index={index} draggableId={item.id}>
			{(provided) => (
				<div ref={provided.innerRef} {...provided.draggableProps}>
					<Card
						withBorder
						sx={(theme) => ({
							backgroundColor: getHoverColor(theme),
						})}
					>
						<Group>
							<Center className="hover:cursor-grab" {...provided.dragHandleProps}>
								<GripIcon />
							</Center>
							<Group>
								<DocumentIcon className="w-5" />
								<Title order={5}>{item.name}</Title>
								<Text color={"dimmed"} size={"sm"}>
									{item.path.split("/")[item.path.split("/").length - 1]}
								</Text>
							</Group>
						</Group>
					</Card>
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
						<Stack
							spacing={"0.5rem"}
							ref={provided.innerRef}
							{...provided.droppableProps}
						>
							{items}
							{provided.placeholder}
						</Stack>
					)}
				</Droppable>
			</DragDropContext>
		</Section>
	);
}
