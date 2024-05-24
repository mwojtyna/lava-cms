"use client";

import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
	SortableContext,
	arrayMove,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TrashIcon } from "@heroicons/react/24/outline";
import { IconGripVertical } from "@tabler/icons-react";
import React, { useMemo } from "react";
import { ActionIcon } from "@/src/components/ui/client/ActionIcon";
import { Card } from "@/src/components/ui/server/Card";
import { usePageEditorStore, type ComponentUI, type Diff } from "@/src/data/stores/pageEditor";
import { cn } from "@/src/utils/styling";

interface Props {
	/** Guaranteed to not be empty when SSR */
	components: ComponentUI[];
	onComponentClicked: (id: string) => void;
}
export function RootComponents(props: Props) {
	const { componentsInit, setComponents, isInitialized } = usePageEditorStore((state) => ({
		componentsInit: state.components,
		setComponents: state.setComponents,
		isInitialized: state.isInitialized,
	}));
	const components = isInitialized ? componentsInit : props.components;

	const dndIds: string[] = useMemo(() => components.map((_, i) => i.toString()), [components]);
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);
	function reorder(e: DragEndEvent) {
		const { active, over } = e;
		if (over && active.id !== over.id) {
			const reordered = structuredClone(
				arrayMove(components, Number(active.id), Number(over.id)),
			);
			for (let i = 0; i < reordered.length; i++) {
				const item = reordered[i]!;
				if (item.order !== i) {
					item.order = i;
				}
			}

			setComponents(reordered);
		}
	}

	function remove(component: ComponentUI) {
		const newComponents = components.toSpliced(components.indexOf(component), 1, {
			...component,
			diff: "deleted",
		});
		setComponents(newComponents);
	}

	return (
		<DndContext
			// https://github.com/clauderic/dnd-kit/issues/926#issuecomment-1640115665
			id={"id"}
			sensors={sensors}
			collisionDetection={closestCenter}
			modifiers={[restrictToParentElement]}
			onDragEnd={reorder}
		>
			<SortableContext items={dndIds} strategy={verticalListSortingStrategy}>
				{components.length > 0 && (
					<div className="flex flex-col gap-2">
						{components.map((component, i) => {
							if (component.diff === "deleted") {
								return null;
							}

							return (
								<ComponentCard
									key={component.id}
									dndId={dndIds[i]!} // Has to be the same as `ids` array passed to `SortableContext`
									component={{
										id: component.id,
										name: component.definition.name,
										diff: component.diff,
									}}
									onClick={props.onComponentClicked}
									onRemove={() => remove(component)}
								/>
							);
						})}
					</div>
				)}
			</SortableContext>
		</DndContext>
	);
}

interface ComponentCardProps {
	dndId: string;
	component: {
		id: string;
		name: string;
		diff: Diff;
	};
	noDrag?: boolean;

	onClick: (id: string) => void;
	onRemove: () => void;
}
export function ComponentCard(props: ComponentCardProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: props.dndId,
		// We have no stable unique property to use as id, so we have to disable this
		// or the list will reshuffle on drop
		// https://github.com/clauderic/dnd-kit/issues/767#issuecomment-1140556346
		animateLayoutChanges: () => false,
		disabled: props.component.diff === "deleted",
	});
	const style: React.CSSProperties = {
		transform: CSS.Translate.toString(transform),
		transition,
		zIndex: isDragging ? 1 : undefined,
	};

	return (
		<Card
			key={props.component.id}
			ref={setNodeRef}
			style={style}
			className={cn(
				"flex-row items-center gap-3 shadow-none transition-colors hover:bg-accent/70 md:p-4",
			)}
			onClick={() => props.onClick(props.component.id)}
			role="button"
		>
			<div className="flex items-center gap-2">
				{!props.noDrag && (
					<IconGripVertical
						className={cn("w-5 cursor-move text-muted-foreground")}
						onClick={(e) => e.stopPropagation()}
						{...attributes}
						{...listeners}
					/>
				)}
				<span className="font-medium">{props.component.name}</span>
			</div>

			<div className="ml-auto flex items-center justify-center gap-1">
				<Actions diff={props.component.diff} deleteComponent={props.onRemove} />
			</div>
		</Card>
	);
}

interface ActionsProps {
	diff: Diff;
	deleteComponent: () => void;
}
function Actions(props: ActionsProps) {
	function handleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, cb: () => void) {
		e.stopPropagation();
		cb();
	}

	return (
		<ActionIcon
			variant={"simple"}
			onClick={(e) => handleClick(e, props.deleteComponent)}
			tooltip="Delete"
		>
			<TrashIcon
				className="w-5 text-destructive/75 hover:text-destructive"
				data-testid="delete-component-btn"
			/>
		</ActionIcon>
	);
}
