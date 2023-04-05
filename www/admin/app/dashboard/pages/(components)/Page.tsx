"use client";

import { Card, Center, Group, Stack, Text } from "@mantine/core";
import { Draggable } from "@hello-pangea/dnd";
import { DocumentIcon, FolderIcon } from "@heroicons/react/24/solid";
import { getHoverColor } from "@admin/src/utils/colors";
import GripIcon from "@admin/app/(components)/GripIcon";
import type { Node } from "./PageTree";
import DropZone from "./DropZone";

export default function Page({ node, index, last }: { node: Node; index: number; last: boolean }) {
	return (
		<Draggable draggableId={node.page.id} index={index} isDragDisabled={node.page.path === "/"}>
			{(provided) => (
				<Card
					p="sm"
					mb={last ? 0 : "sm"}
					withBorder
					sx={(theme) => ({
						backgroundColor: getHoverColor(theme),
					})}
					ref={provided.innerRef}
					{...provided.draggableProps}
				>
					<Group
						ml={node.page.path === "/" ? "0.5rem" : 0}
						mb={node.children.length > 0 ? "sm" : 0}
					>
						{node.page.path !== "/" && (
							<Center className="hover:cursor-grab" {...provided.dragHandleProps}>
								<GripIcon />
							</Center>
						)}
						{node.children.length === 0 ? (
							<DocumentIcon className="w-5" />
						) : (
							<FolderIcon className="w-5 text-orange-400" />
						)}
						<Text weight={500} size={"md"}>
							{node.page.name}
						</Text>
						<Text color={"dimmed"} size={"sm"}>
							{node.page.path.split("/")[node.page.path.split("/").length - 1]}
						</Text>
					</Group>

					{node.children.length > 0 && (
						<DropZone droppableId={node.page.id}>
							{node.children.map((child, i, array) => (
								<Page
									key={child.page.id}
									node={child}
									index={i}
									last={i === array.length - 1}
								/>
							))}
						</DropZone>
					)}
				</Card>
			)}
		</Draggable>
	);
}
