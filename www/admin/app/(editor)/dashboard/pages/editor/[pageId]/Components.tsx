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
import { ArrowUturnLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { IconGripVertical } from "@tabler/icons-react";
import React, { useMemo } from "react";
import { ActionIcon } from "@/src/components/ui/client/ActionIcon";
import { Card } from "@/src/components/ui/server/Card";
import { usePageEditorStore, type ComponentUI, type Diff } from "@/src/data/stores/pageEditor";
import { cn } from "@/src/utils/styling";

interface Props {
	components: ComponentUI[];
	onComponentClicked: (id: string) => void;
}
export function Components(props: Props) {
	const { originalComponents, setComponents } = usePageEditorStore((state) => ({
		originalComponents: state.originalComponents,
		setComponents: state.setComponents,
	}));

	const dndIds: string[] = useMemo(
		() => props.components.map((_, i) => i.toString()),
		[props.components],
	);
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
				arrayMove(props.components, Number(active.id), Number(over.id)),
			);
			for (let i = 0; i < reordered.length; i++) {
				const item = reordered[i]!;
				if (item.order !== i) {
					item.order = i;
					item.reordered = true;
				}
			}

			setComponents(reordered);
		}
	}

	function restore(component: ComponentUI) {
		const original = originalComponents.find((comp) => comp.id === component.id)!;
		const newComponents = props.components.map((c) =>
			c.id === component.id
				? {
						...original,
						reordered: component.reordered,
				  }
				: c,
		);
		setComponents(newComponents);
	}
	function remove(component: ComponentUI) {
		const newComponents = props.components.toSpliced(props.components.indexOf(component), 1, {
			...component,
			diff: "deleted",
		});
		setComponents(newComponents);
	}
	function unRemove(component: ComponentUI) {
		const newComponents = props.components.toSpliced(props.components.indexOf(component), 1, {
			...component,
			diff: "none",
		});
		setComponents(newComponents);
	}
	function unAdd(component: ComponentUI) {
		setComponents(props.components.filter((comp) => comp.id !== component.id));
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
				{props.components.length > 0 && (
					<div className="flex flex-col gap-2">
						{props.components.map((component, i) => (
							<ComponentCard
								key={component.id}
								dndId={dndIds[i]!} // Has to be the same as `ids` array passed to `SortableContext`
								component={{
									id: component.id,
									name: component.definition.name,
									diff: component.diff,
								}}
								onClick={props.onComponentClicked}
								onRestore={() => restore(component)}
								onRemove={() => remove(component)}
								onUnRemove={() => unRemove(component)}
								onUnAdd={() => unAdd(component)}
							/>
						))}
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
	extraActions?: React.ReactNode;

	onClick: (id: string) => void;
	onRestore: () => void;
	onRemove: () => void;
	onUnRemove: () => void;
	onUnAdd: () => void;
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

	const diffStyle: Record<Exclude<Diff, "none">, string> = {
		added: "border-l-green-500",
		edited: "border-l-brand",
		replaced: "border-l-brand",
		deleted: "border-l-red-500",
	};

	return (
		<Card
			key={props.component.id}
			ref={setNodeRef}
			style={style}
			className={cn(
				props.component.diff !== "none" &&
					`border-l-[3px] ${diffStyle[props.component.diff]}`,

				props.component.diff !== "deleted" && "hover:bg-accent/70",
				props.component.diff === "deleted" && "cursor-auto",

				"flex-row items-center gap-3 shadow-none transition-colors md:p-4",
			)}
			onClick={() =>
				props.component.diff !== "deleted" ? props.onClick(props.component.id) : undefined
			}
			role="button"
			aria-disabled={props.component.diff === "deleted"}
		>
			<div className="flex items-center gap-2">
				{!props.noDrag && (
					<IconGripVertical
						className={cn(
							"w-5 cursor-move text-muted-foreground",
							props.component.diff === "deleted" &&
								"cursor-auto text-muted-foreground/50",
						)}
						onClick={(e) => e.stopPropagation()}
						{...attributes}
						{...listeners}
					/>
				)}
				<span className="font-medium">{props.component.name}</span>
			</div>

			<div className="ml-auto flex items-center justify-center gap-1">
				{props.extraActions}
				<Actions
					diff={props.component.diff}
					restoreComponent={props.onRestore}
					deleteComponent={props.onRemove}
					unRemoveComponent={props.onUnRemove}
					unAddComponent={props.onUnAdd}
				/>
			</div>
		</Card>
	);
}

interface ActionsProps {
	diff: Diff;
	restoreComponent: () => void;
	deleteComponent: () => void;
	unRemoveComponent: () => void;
	unAddComponent: () => void;
}
function Actions(props: ActionsProps) {
	function handleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, cb: () => void) {
		e.stopPropagation();
		cb();
	}

	switch (props.diff) {
		case "replaced":
		case "edited": {
			return (
				<ActionIcon
					variant={"simple"}
					onClick={(e) => handleClick(e, props.restoreComponent)}
					tooltip="Restore"
				>
					<ArrowUturnLeftIcon className="w-5" data-testid="restore-component-btn" />
				</ActionIcon>
			);
		}
		case "deleted": {
			return (
				<ActionIcon
					variant={"simple"}
					onClick={(e) => handleClick(e, props.unRemoveComponent)}
					tooltip="Restore"
				>
					<ArrowUturnLeftIcon className="w-5" data-testid="restore-component-btn" />
				</ActionIcon>
			);
		}

		case "added":
		case "none": {
			return (
				<ActionIcon
					variant={"simple"}
					onClick={(e) =>
						handleClick(
							e,
							props.diff === "added" ? props.unAddComponent : props.deleteComponent,
						)
					}
					tooltip="Delete"
				>
					<TrashIcon
						className="w-5 text-destructive/75 hover:text-destructive"
						data-testid="delete-component-btn"
					/>
				</ActionIcon>
			);
		}
	}
}
