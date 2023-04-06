"use client";

import { Card, Center, Group, Text } from "@mantine/core";
import { Draggable, type DraggableProvided, type DraggableStateSnapshot } from "@hello-pangea/dnd";
import { DocumentIcon, FolderIcon } from "@heroicons/react/24/solid";
import { getHoverColor } from "@admin/src/utils/colors";
import GripIcon from "@admin/app/(components)/GripIcon";
import type { Node } from "./PageTree";
import DropZone from "./DropZone";

interface Props {
	node: Node;
	index: number;
	last: boolean;
}
export default function Page(props: Props) {
	return (
		<Draggable
			draggableId={props.node.page.id}
			index={props.index}
			isDragDisabled={props.node.page.path === "/"}
		>
			{(provided, snapshot) => <Content {...props} provided={provided} snapshot={snapshot} />}
		</Draggable>
	);
}

function Content(
	props: Props & {
		provided: DraggableProvided;
		snapshot: DraggableStateSnapshot;
	}
) {
	const child = (
		<Card
			p="sm"
			mb={!props.last || props.snapshot.isDragging ? "sm" : 0}
			withBorder
			sx={(theme) => ({
				backgroundColor: getHoverColor(theme),
			})}
			ref={props.provided.innerRef}
			{...props.provided.draggableProps}
		>
			<Group
				ml={props.node.page.path === "/" ? "0.5rem" : 0}
				mb={props.node.children.length > 0 ? "sm" : 0}
			>
				{props.node.page.path !== "/" && (
					<Center className="hover:cursor-grab" {...props.provided.dragHandleProps}>
						<GripIcon />
					</Center>
				)}
				{props.node.children.length === 0 ? (
					<DocumentIcon className="w-5" />
				) : (
					<FolderIcon className="w-5 text-orange-400" />
				)}
				<Text weight={500} size={"md"}>
					{props.node.page.name}
				</Text>
				<Text color={"dimmed"} size={"sm"}>
					{props.node.page.path.split("/")[props.node.page.path.split("/").length - 1]}
				</Text>
			</Group>

			<DropZone
				droppableId={props.node.page.id}
				renderClone={(provided) => (
					<div
						ref={provided.innerRef}
						{...provided.draggableProps}
						className="h-full w-full bg-red-600"
					></div>
				)}
			>
				{props.node.children.map((child, i, array) => (
					<Page
						key={child.page.id}
						node={child}
						index={i}
						last={i === array.length - 1}
					/>
				))}
			</DropZone>
		</Card>
	);

	return child;
}
