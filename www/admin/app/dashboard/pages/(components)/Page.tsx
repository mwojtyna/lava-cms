"use client";

import { Card, Group, Stack, Text } from "@mantine/core";
import { DocumentIcon, FolderIcon } from "@heroicons/react/24/solid";
import { getHoverColor } from "@admin/src/utils/colors";
import type { Node } from "./PageTree";

interface PageProps {
	node: Node;
	last: boolean;
}
export default function Page(props: PageProps) {
	return (
		<Card
			p="sm"
			withBorder
			sx={(theme) => ({
				backgroundColor: getHoverColor(theme),
			})}
		>
			<Group
				ml={props.node.children.length > 0 ? "0.25rem" : 0}
				mb={props.node.children.length > 0 ? "md" : 0}
			>
				{props.node.children.length === 0 ? (
					<DocumentIcon width="1.25rem" />
				) : (
					<FolderIcon color="rgb(251 146 60)" width="1.25rem" />
				)}
				<Text weight={500} size={"md"}>
					{props.node.page.name}
				</Text>
				<Text color={"dimmed"} size={"sm"}>
					{props.node.page.path.split("/")[props.node.page.path.split("/").length - 1]}
				</Text>
			</Group>

			<Stack spacing="sm">
				{props.node.children.map((child, i, array) => (
					<Page key={child.page.id} node={child} last={i === array.length - 1} />
				))}
			</Stack>
		</Card>
	);
}
