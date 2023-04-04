"use client";

import { useMemo } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Box, Card, Center, Group, Stack, Text } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { DocumentIcon } from "@heroicons/react/24/solid";
import { Section } from "@admin/app/dashboard/(components)/Section";
import { trpcReact } from "@admin/src/utils/trpcReact";
import type { Page } from "api/prisma/types";
import { getHoverColor } from "@admin/src/utils/colors";
import GripIcon from "@admin/app/(components)/GripIcon";

interface Node {
	page: Page;
	children: Node[];
}

export default function PageTree({ initialData }: { initialData: Page[] }) {
	const data = trpcReact.pages.getPages.useQuery().data ?? initialData;

	// Returns root node
	const pageTree: Node = useMemo(() => {
		const rootPage = data.find((page) => page.path === "/")!;
		return {
			page: rootPage,
			children: findChildren(rootPage),
		};

		function findChildren(root: Page) {
			const children: Page[] = data.filter(
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

	const [rootPages, handlers] = useListState(pageTree.children);

	return (
		<Section>
			<Section.Title>Structure</Section.Title>
			<Stack>
				<Stack spacing={"0.5rem"}>
					<Card
						component={Stack}
						p="sm"
						withBorder
						sx={(theme) => ({
							backgroundColor: getHoverColor(theme),
						})}
					>
						<Group>
							<Center className="hover:cursor-grab">
								<GripIcon />
							</Center>

							<Group>
								<DocumentIcon className="w-5" />
								<Text weight={500} size={"md"}>
									{pageTree.page.name}
								</Text>
								<Text color={"dimmed"} size={"sm"}>
									{
										pageTree.page.path.split("/")[
											pageTree.page.path.split("/").length - 1
										]
									}
								</Text>
							</Group>
						</Group>
					</Card>
				</Stack>
			</Stack>
			<pre>{JSON.stringify(pageTree, null, 4)}</pre>
		</Section>
	);
}
