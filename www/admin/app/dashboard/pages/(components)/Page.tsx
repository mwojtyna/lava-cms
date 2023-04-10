"use client";

import { ActionIcon, Card, Group, Stack, Text, createStyles, useMantineTheme } from "@mantine/core";
import {
	ChevronRightIcon,
	ChevronUpDownIcon,
	DocumentIcon,
	DocumentPlusIcon,
	FolderArrowDownIcon,
	FolderIcon,
	FolderOpenIcon,
	PencilSquareIcon,
	TrashIcon,
} from "@heroicons/react/24/solid";
import type { Page as PageType } from "api/prisma/types";
import { getBorderColor, getHoverColor } from "@admin/src/utils/colors";
import type { Node } from "./PageTree";

const useStyles = createStyles((theme) => ({
	icon: {
		backgroundColor: getHoverColor(theme),
	},
}));

interface PageProps {
	node: Node;
	last: boolean;
	openNewPageModal: (page: PageType) => void;
	openEditPageModal: (page: PageType) => void;
	openDeletePageModal: (page: PageType) => void;
	root?: boolean;
}
export default function Page(props: PageProps) {
	const { classes } = useStyles();
	const theme = useMantineTheme();

	return (
		<>
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
						{/* Page details */}
						<Group spacing={"sm"}>
							{props.node.children.length > 0 ? (
								<>
									<ActionIcon variant="light" className={classes.icon}>
										<ChevronRightIcon
											className="w-5"
											style={{
												transform: `rotate(${true ? "90deg" : "0"})`,
											}}
										/>
									</ActionIcon>

									{true ? (
										<FolderOpenIcon className="w-5" />
									) : (
										<FolderIcon className="w-5" />
									)}
								</>
							) : (
								<DocumentIcon className="w-5" />
							)}

							<Text sx={{ fontWeight: 500 }}>{props.node.page.name}</Text>

							<Text color="dimmed" size="sm">
								{props.node.page.url}
							</Text>

							<ActionIcon
								variant="light"
								className={classes.icon}
								onClick={() => props.openEditPageModal(props.node.page)}
							>
								<PencilSquareIcon className="w-4" />
							</ActionIcon>
						</Group>

						{/* Page actions */}
						<Group spacing={"xs"}>
							{props.root ? (
								<>
									<ActionIcon
										variant="light"
										className={classes.icon}
										onClick={() => props.openNewPageModal(props.node.page)}
									>
										<DocumentPlusIcon className="w-5" />
									</ActionIcon>
								</>
							) : (
								<>
									<ChevronUpDownIcon className="w-5" />

									<ActionIcon
										variant="light"
										className={classes.icon}
										onClick={() => props.openNewPageModal(props.node.page)}
									>
										<DocumentPlusIcon className="w-5" />
									</ActionIcon>

									<ActionIcon variant="light" className={classes.icon}>
										<FolderArrowDownIcon className="w-5" />
									</ActionIcon>

									<ActionIcon
										variant="light"
										className={classes.icon}
										onClick={() => props.openDeletePageModal(props.node.page)}
									>
										<TrashIcon color={theme.colors.red[8]} className="w-5" />
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
						sx={(theme) => ({
							borderLeft: `2px solid ${getBorderColor(theme)}`,
						})}
					>
						{props.node.children.map((child, index) => (
							<Page
								key={child.page.id}
								node={child}
								last={index === props.node.children.length - 1}
								openNewPageModal={props.openNewPageModal}
								openEditPageModal={props.openEditPageModal}
								openDeletePageModal={props.openDeletePageModal}
							/>
						))}
					</Stack>
				)}
			</Stack>
		</>
	);
}
