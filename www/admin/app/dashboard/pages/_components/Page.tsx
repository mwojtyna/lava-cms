"use client";

import { useMemo, useState } from "react";
import {
	ActionIcon,
	Anchor,
	Card,
	Group,
	Portal,
	Stack,
	Text,
	Tooltip,
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
import {
	DndContext,
	DragOverlay,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getBorderColor, getHoverColor } from "@admin/src/utils/colors";
import { usePagePreferences } from "@admin/src/hooks/usePagePreferences";
import type { TreeNode } from "./PageTree";
import { trpcReact } from "@admin/src/utils/trpcReact";

const ANIMATION_DURATION = 200;

const useStyles = createStyles((theme) => ({
	icon: {
		backgroundColor: getHoverColor(theme),
	},
}));

interface PageProps {
	node: TreeNode;
	last?: boolean;
	root?: boolean;
	openAddPageModal: (node: TreeNode) => void;
	openEditPageModal: (node: TreeNode) => void;
	openDeletePageModal: (node: TreeNode) => void;
	openMovePageModal: (node: TreeNode) => void;
}

export type LocalStorageData = { [x: string]: boolean };

export default function Page(props: PageProps) {
	const { classes } = useStyles();
	const theme = useMantineTheme();

	const [parent] = useAutoAnimate({ duration: ANIMATION_DURATION });
	const [showMargin, setShowMargin] = useState(true);

	const { pagePreferences, setPagePreferences } = usePagePreferences(props.node.page.id);

	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
		id: props.node.page.id,
	});
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);
	const style = {
		transform: CSS.Translate.toString(transform),
		transition,
	};

	const sortedChildren = useMemo(
		() => props.node.children.sort((a, b) => a.page.order - b.page.order),
		[props.node.children]
	);
	const reorderMutation = trpcReact.pages.reorderPage.useMutation();

	return (
		<div data-testid="page" ref={setNodeRef} style={style}>
			<Card
				pl={sortedChildren.length > 0 ? "xs" : "sm"}
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
						{sortedChildren.length > 0 ? (
							<>
								<ActionIcon
									variant="light"
									className={classes.icon}
									onClick={() => {
										if (!pagePreferences.expanded) setShowMargin(true);

										setPagePreferences({
											...pagePreferences,
											expanded: !pagePreferences.expanded,
										});
									}}
								>
									<ChevronRightIcon
										className="w-5"
										style={{
											transform: `rotate(${
												pagePreferences.expanded ? "90deg" : "0"
											})`,
										}}
									/>
								</ActionIcon>

								{pagePreferences.expanded ? (
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
							<Tooltip label="Open the generated page" withinPortal>
								<Anchor
									className="hover:underline"
									href={props.node.page.url}
									target="_blank"
									unstyled
								>
									{props.node.page.url}
								</Anchor>
							</Tooltip>
						</Text>

						<Tooltip label="Edit page details" withinPortal>
							<ActionIcon
								variant="light"
								className={classes.icon}
								onClick={() => props.openEditPageModal(props.node)}
							>
								<PencilSquareIcon className="w-4" />
							</ActionIcon>
						</Tooltip>

						{props.node.page.order.toString()}
					</Group>

					{/* Page actions */}
					<Group spacing={"xs"}>
						{props.root ? (
							<>
								<Tooltip label="Add new page" withinPortal>
									<ActionIcon
										variant="light"
										className={classes.icon}
										onClick={() => props.openAddPageModal(props.node)}
									>
										<DocumentPlusIcon className="w-5" />
									</ActionIcon>
								</Tooltip>
							</>
						) : (
							<>
								<Tooltip label="Reorder page (click and drag)" withinPortal>
									<ActionIcon {...listeners} {...attributes}>
										<ChevronUpDownIcon className="w-5" />
									</ActionIcon>
								</Tooltip>

								<Tooltip label="Add new page" withinPortal>
									<ActionIcon
										variant="light"
										className={classes.icon}
										onClick={() => props.openAddPageModal(props.node)}
									>
										<DocumentPlusIcon className="w-5" />
									</ActionIcon>
								</Tooltip>

								<Tooltip label="Move page" withinPortal>
									<ActionIcon
										variant="light"
										className={classes.icon}
										onClick={() => props.openMovePageModal(props.node)}
									>
										<FolderArrowDownIcon className="w-5" />
									</ActionIcon>
								</Tooltip>

								<Tooltip label="Delete page" withinPortal>
									<ActionIcon
										variant="light"
										className={classes.icon}
										onClick={() => props.openDeletePageModal(props.node)}
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
				mt={showMargin && sortedChildren.length > 0 ? "xs" : 0}
				mah={pagePreferences.expanded ? "100vh" : 0}
				opacity={pagePreferences.expanded ? 1 : 0}
				onTransitionEnd={() => {
					if (!pagePreferences.expanded) setShowMargin(false);
				}}
				sx={(theme) => ({
					borderLeft: `2px solid ${getBorderColor(theme)}`,
					transition: `max-height ${ANIMATION_DURATION}ms ease-in-out, opacity ${ANIMATION_DURATION}ms ease-in-out`,
				})}
			>
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragStart={() => (document.body.style.cursor = "grabbing")}
					onDragEnd={(e) => {
						const activeNode = sortedChildren.find(
							(child) => child.page.id === e.active.id
						)!;
						const overNode = sortedChildren.find(
							(child) => child.page.id === e.over?.id
						);

						if (!overNode) return;

						reorderMutation.mutate({
							activeId: e.active.id.toString(),
							activeParentId: activeNode.page.parent_id!,
							overId: overNode.page.id,
							order: activeNode.page.order,
							newOrder: overNode.page.order,
						});
						document.body.style.cursor = "default";
					}}
				>
					<SortableContext
						items={sortedChildren.map((child) => child.page.id)}
						strategy={verticalListSortingStrategy}
					>
						{sortedChildren.map((child, index) => (
							<Page
								key={child.page.id}
								node={child}
								last={index === sortedChildren.length - 1}
								openAddPageModal={props.openAddPageModal}
								openEditPageModal={props.openEditPageModal}
								openDeletePageModal={props.openDeletePageModal}
								openMovePageModal={props.openMovePageModal}
							/>
						))}
					</SortableContext>

					<Portal>
						<DragOverlay dropAnimation={null}></DragOverlay>
					</Portal>
				</DndContext>
			</Stack>
		</div>
	);
}
