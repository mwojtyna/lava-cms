"use client";

import { ActionIcon, Card, Group, Stack, Text, createStyles, useMantineTheme } from "@mantine/core";
import { getBorderColor, getHoverColor } from "@admin/src/utils/colors";
import type { Node } from "./PageTree";
import {
	ChevronRightIcon,
	ChevronUpDownIcon,
	DocumentIcon,
	DocumentPlusIcon,
	FolderArrowDownIcon,
	FolderIcon,
	PencilSquareIcon,
	TrashIcon,
} from "@heroicons/react/24/solid";

const useStyles = createStyles((theme) => ({
	icon: {
		backgroundColor: getHoverColor(theme),
	},
}));

interface PageProps {
	node: Node;
	last: boolean;
	root?: boolean;
}
export default function Page(props: PageProps) {
	const { classes } = useStyles();
	const theme = useMantineTheme();

	return (
		<Stack spacing="xs">
			<Card
				pl={props.node.children.length > 0 ? "xs" : "sm"}
				pr="xs"
				py="xs"
				withBorder
				sx={(theme) => ({
					backgroundColor: getHoverColor(theme),
				})}
			>
				<Group position="apart">
					<Group spacing={"sm"}>
						{props.node.children.length > 0 ? (
							<>
								<ActionIcon variant="light" className={classes.icon}>
									<ChevronRightIcon
										width="1.25rem"
										style={{
											transform: `rotate(${true ? "90deg" : "0"})`,
										}}
									/>
								</ActionIcon>
								<FolderIcon width="1.25rem" />
							</>
						) : (
							<DocumentIcon width="1.25rem" />
						)}

						<Text sx={{ fontWeight: 500 }}>{props.node.page.name}</Text>
						{!props.root && (
							<Text color="dimmed" size="sm">
								{
									props.node.page.path.split("/")[
										props.node.page.path.split("/").length - 1
									]
								}
							</Text>
						)}

						<ActionIcon variant="light" className={classes.icon}>
							<PencilSquareIcon width="1rem" />
						</ActionIcon>
					</Group>

					<Group spacing={"xs"}>
						{props.root ? (
							<>
								<ActionIcon variant="light" className={classes.icon}>
									<DocumentPlusIcon width="1.25rem" />
								</ActionIcon>
							</>
						) : (
							<>
								<ChevronUpDownIcon width="1.25rem" />

								<ActionIcon variant="light" className={classes.icon}>
									<DocumentPlusIcon width="1.25rem" />
								</ActionIcon>

								<ActionIcon variant="light" className={classes.icon}>
									<FolderArrowDownIcon width="1.25rem" />
								</ActionIcon>

								<ActionIcon variant="light" className={classes.icon}>
									<TrashIcon color={theme.colors.red[8]} width="1.25rem" />
								</ActionIcon>
							</>
						)}
					</Group>
				</Group>
			</Card>

			{props.node.children.length > 0 && (
				<Stack
					spacing="xs"
					pl="lg"
					sx={(theme) => ({ borderLeft: `1px solid ${getBorderColor(theme)}` })}
				>
					{props.node.children.map((child, index) => (
						<Page
							key={child.page.id}
							node={child}
							last={index === props.node.children.length - 1}
						/>
					))}
				</Stack>
			)}
		</Stack>
	);
}
