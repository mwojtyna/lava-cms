"use client";

import { useState } from "react";
import {
	ActionIcon,
	Anchor,
	Card,
	Group,
	Stack,
	Text,
	Tooltip,
	createStyles,
	useMantineTheme,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
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

export type LocalStorageData = { [x: string]: boolean };

export default function Page(props: PageProps) {
	const { classes } = useStyles();
	const theme = useMantineTheme();

	const [parent] = useAutoAnimate({ duration: ANIMATION_DURATION });
	const [showMargin, setShowMargin] = useState(true);

	const [isExpanded, setIsExpanded] = useLocalStorage({
		key: "page-tree",
		defaultValue: {
			[props.node.page.id]: true,
		},
	});
	const isThisExpanded = () => isExpanded[props.node.page.id];

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
										if (!isThisExpanded()) setShowMargin(true);

										setIsExpanded({
											...isExpanded,
											[props.node.page.id]: !isThisExpanded(),
										});
									}}
								>
									<ChevronRightIcon
										className="w-5"
										style={{
											transform: `rotate(${
												isThisExpanded() ? "90deg" : "0"
											})`,
										}}
									/>
								</ActionIcon>

								{isThisExpanded() ? (
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

						<Tooltip label="Edit page details" withinPortal>
							<ActionIcon
								variant="light"
								className={classes.icon}
								onClick={() => props.openEditPageModal(props.node.page)}
							>
								<PencilSquareIcon className="w-4" />
							</ActionIcon>
						</Tooltip>
					</Group>

					{/* Page actions */}
					<Group spacing={"xs"}>
						{props.root ? (
							<>
								<Tooltip label="Add new page" withinPortal>
									<ActionIcon
										variant="light"
										className={classes.icon}
										onClick={() => props.openAddPageModal(props.node.page)}
									>
										<DocumentPlusIcon className="w-5" />
									</ActionIcon>
								</Tooltip>
							</>
						) : (
							<>
								<ChevronUpDownIcon className="w-5" />

								<Tooltip label="Add new page" withinPortal>
									<ActionIcon
										variant="light"
										className={classes.icon}
										onClick={() => props.openAddPageModal(props.node.page)}
									>
										<DocumentPlusIcon className="w-5" />
									</ActionIcon>
								</Tooltip>

								<Tooltip label="Move page" withinPortal>
									<ActionIcon
										variant="light"
										className={classes.icon}
										onClick={() => props.openMovePageModal(props.node.page)}
									>
										<FolderArrowDownIcon className="w-5" />
									</ActionIcon>
								</Tooltip>

								<Tooltip label="Delete page" withinPortal>
									<ActionIcon
										variant="light"
										className={classes.icon}
										onClick={() => props.openDeletePageModal(props.node.page)}
									>
										<TrashIcon color={theme.colors.red[8]} className="w-5" />
									</ActionIcon>
								</Tooltip>
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
				mah={isThisExpanded() ? "100vh" : 0}
				opacity={isThisExpanded() ? 1 : 0}
				onTransitionEnd={() => {
					if (!isThisExpanded()) setShowMargin(false);
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
