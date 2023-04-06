"use client";

import { Card, Center, Group, Text } from "@mantine/core";
import { Draggable, type DraggableProvided, type DraggableStateSnapshot } from "@hello-pangea/dnd";
import { DocumentIcon, FolderIcon } from "@heroicons/react/24/solid";
import { getHoverColor } from "@admin/src/utils/colors";
import GripIcon from "@admin/app/(components)/GripIcon";
import { type Node, getNode } from "./PageTree";
import DropZone from "./DropZone";

interface PageProps {
	node: Node;
	index: number;
	last: boolean;
}
export default function Page(props: PageProps) {
	return (
		<Draggable
			draggableId={props.node.page.id}
			index={props.index}
			isDragDisabled={props.node.page.path === "/"}
		>
			{(provided, snapshot) => (
				<Card
					p="sm"
					mb={!props.last || snapshot.isDragging ? "sm" : 0}
					withBorder
					sx={(theme) => ({
						backgroundColor: getHoverColor(theme),
					})}
					ref={provided.innerRef}
					{...provided.draggableProps}
				>
					<Group
						ml={props.node.page.path === "/" ? "0.5rem" : 0}
						mb={props.node.children.length > 0 ? "sm" : 0}
					>
						{props.node.page.path !== "/" && (
							<Center className="hover:cursor-grab" {...provided.dragHandleProps}>
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
							{
								props.node.page.path.split("/")[
									props.node.page.path.split("/").length - 1
								]
							}
						</Text>
					</Group>

					<DropZone
						droppableId={props.node.page.id}
						renderClone={(provided) => {
							const node = getNode(provided.draggableProps["data-rfd-draggable-id"])!;
							return <Clone node={node} provided={provided} last={true} />;
						}}
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
			)}
		</Draggable>
	);
}

interface CloneProps {
	node: Node;
	last: boolean;
	provided?: DraggableProvided;
	snapshot?: DraggableStateSnapshot;
}
export function Clone(props: CloneProps) {
	return (
		<Card
			p="sm"
			mb={!props.last || props.snapshot?.isDragging ? "sm" : 0}
			withBorder
			sx={(theme) => ({
				backgroundColor: getHoverColor(theme),
			})}
			ref={props.provided?.innerRef}
			{...props.provided?.draggableProps}
		>
			<Group
				ml={props.node.page.path === "/" ? "0.5rem" : 0}
				mb={props.node.children.length > 0 ? "sm" : 0}
			>
				{props.node.page.path !== "/" && (
					<Center>
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

			{props.node.children.map((child, i, array) => (
				<Clone key={child.page.id} node={child} last={i === array.length - 1} />
			))}
		</Card>
	);
}
