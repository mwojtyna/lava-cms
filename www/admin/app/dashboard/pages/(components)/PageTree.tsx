"use client";

import { useMemo } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { Section } from "@admin/app/dashboard/(components)/Section";
import { trpcReact } from "@admin/src/utils/trpcReact";
import type { Page as PageType } from "api/prisma/types";
import Page from "./Page";
import DropZone from "./DropZone";

export interface Node {
	page: PageType;
	children: Node[];
}
function getNode(id: string, node: Node): Node | undefined {
	if (node.page.id === id) {
		return node;
	}

	for (const child of node.children) {
		const found = getNode(id, child);
		if (found) {
			return found;
		}
	}

	return undefined;
}

export default function PageTree({ initialData }: { initialData: PageType[] }) {
	const data = trpcReact.pages.getPages.useQuery().data ?? initialData;

	const rootNode: Node = useMemo(() => {
		const rootPage = data.find((page) => page.path === "/")!;
		return {
			page: rootPage,
			children: findChildren(rootPage),
		};

		function findChildren(root: PageType) {
			const children: PageType[] = data.filter(
				(page) =>
					page.path !== root.path && // Not the root page
					page.path.split(root.path).length === 2 && // Is a child of the root page
					page.path.replace(root.path, "").split("/").length ===
						(root.path === "/" ? 1 : 2) // Is a direct child of the root page
			);
			if (children.length === 0) {
				return [];
			}

			const nodeChildren: Node[] = [];
			children.forEach((child) => {
				nodeChildren.push({
					page: child,
					children: findChildren(child),
				});
			});

			return nodeChildren;
		}
	}, [data]);

	function reorder(result: DropResult) {
		console.log(
			getNode(result.destination?.droppableId, rootNode)?.page.path,
			result.destination?.index
		);
	}

	return (
		<Section>
			<Section.Title>Structure</Section.Title>
			<DragDropContext onDragEnd={reorder}>
				<DropZone droppableId={rootNode.page.id}>
					{rootNode.children.map((child, i, array) => (
						<Page
							key={child.page.id}
							node={child}
							index={i}
							last={i === array.length - 1}
						/>
					))}
				</DropZone>
			</DragDropContext>
		</Section>
	);
}
