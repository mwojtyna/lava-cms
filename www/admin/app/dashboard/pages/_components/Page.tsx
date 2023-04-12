"use client";

import { useState } from "react";
import {
	ActionIcon,
	Anchor,
	Card,
	Group,
	Stack,
	Text,
	createStyles,
	useMantineTheme,
} from "@mantine/core";
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
import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { Page as PageType } from "api/prisma/types";
import { getBorderColor, getHoverColor } from "@admin/src/utils/colors";
import type { Node } from "./PageTree";

const ANIMATION_DURATION = 200;

const useStyles = createStyles((theme) => ({
	icon: {
		backgroundColor: getHoverColor(theme),
	},
}));

interface PageProps {
	node: Node;
	last?: boolean;
	root?: boolean;
	openAddPageModal: (page: PageType) => void;
	openEditPageModal: (page: PageType) => void;
	openDeletePageModal: (page: PageType) => void;
	openMovePageModal: (page: PageType) => void;
}
export default function Page(props: PageProps) {
	const { classes } = useStyles();
	const theme = useMantineTheme();

	const [parent] = useAutoAnimate({ duration: ANIMATION_DURATION });
	const [isExpanded, setIsExpanded] = useState(true);
	const [showMargin, setShowMargin] = useState(true);

	return (
		<div data-testid="page">
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
								<ActionIcon
									variant="light"
									className={classes.icon}
									onClick={() => {
										if (!isExpanded) setShowMargin(true);
										setIsExpanded(!isExpanded);
									}}
								>
									<ChevronRightIcon
										className="w-5"
										style={{
											transform: `rotate(${isExpanded ? "90deg" : "0"})`,
										}}
									/>
								</ActionIcon>

								{isExpanded ? (
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
							<Anchor
								className="hover:underline"
								href={props.node.page.url}
								target="_blank"
								unstyled
							>
								{props.node.page.url}
							</Anchor>
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
									onClick={() => props.openAddPageModal(props.node.page)}
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
									onClick={() => props.openAddPageModal(props.node.page)}
								>
									<DocumentPlusIcon className="w-5" />
								</ActionIcon>

								<ActionIcon
									variant="light"
									className={classes.icon}
									onClick={() => props.openMovePageModal(props.node.page)}
								>
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

			<Stack
				ref={parent}
				spacing="xs"
				pl="lg"
				mt={showMargin && props.node.children.length > 0 ? "xs" : 0}
				mah={isExpanded ? "100vh" : 0}
				opacity={isExpanded ? 1 : 0}
				onTransitionEnd={() => {
					if (!isExpanded) setShowMargin(false);
				}}
				sx={(theme) => ({
					borderLeft: `2px solid ${getBorderColor(theme)}`,
					transition: `max-height ${ANIMATION_DURATION}ms ease-in-out, opacity ${ANIMATION_DURATION}ms ease-in-out`,
				})}
			>
				{props.node.children.map((child, index) => (
					<Page
						key={child.page.id}
						node={child}
						last={index === props.node.children.length - 1}
						openAddPageModal={props.openAddPageModal}
						openEditPageModal={props.openEditPageModal}
						openDeletePageModal={props.openDeletePageModal}
						openMovePageModal={props.openMovePageModal}
					/>
				))}
			</Stack>
		</div>
	);
}
