"use client";

import { useState } from "react";
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
import { getBorderColor, getHoverColor } from "@admin/src/utils/colors";
import type { Node } from "./PageTree";
import { EditNameModal } from "./Modals";

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

	const [isEditing, setIsEditing] = useState(false);

	return (
		<>
			<EditNameModal
				page={props.node.page}
				opened={isEditing}
				onClose={() => setIsEditing(false)}
			/>

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

							{/* name */}
							<Text sx={{ fontWeight: 500 }}>{props.node.page.name}</Text>

							{/* slug */}
							{!props.root && (
								<Text color="dimmed" size="sm">
									{
										props.node.page.path.split("/")[
											props.node.page.path.split("/").length - 1
										]
									}
								</Text>
							)}

							<ActionIcon
								variant="light"
								className={classes.icon}
								onClick={() => setIsEditing(!isEditing)}
							>
								<PencilSquareIcon className="w-4" />
							</ActionIcon>
						</Group>

						{/* Page actions */}
						<Group spacing={"xs"}>
							{props.root ? (
								<>
									<ActionIcon variant="light" className={classes.icon}>
										<DocumentPlusIcon className="w-5" />
									</ActionIcon>
								</>
							) : (
								<>
									<ChevronUpDownIcon className="w-5" />

									<ActionIcon variant="light" className={classes.icon}>
										<DocumentPlusIcon className="w-5" />
									</ActionIcon>

									<ActionIcon variant="light" className={classes.icon}>
										<FolderArrowDownIcon className="w-5" />
									</ActionIcon>

									<ActionIcon variant="light" className={classes.icon}>
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
		</>
	);
}
