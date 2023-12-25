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
import { ActionIcon } from "@/src/components/ui/client";
import { Card } from "@/src/components/ui/server";
import { usePageEditor, type ComponentUI, type Diff } from "@/src/data/stores/pageEditor";
import { cn } from "@/src/utils/styling";

interface Props {
	components: ComponentUI[];
	onComponentClicked: (index: number) => void;
}
export function Components(props: Props) {
	const { components, setComponents } = usePageEditor();

	const ids: string[] = useMemo(
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
			// I have no fucking clue how the fuck mutating items of this array in the for loop below
			// changes `components` and `originalComponents` arrays in the page editor store,
			// but it somehow fucking does. So I have to write this stupid shit to fix it.
			// Even the fucking browser doesn't understand this clusterfuck and displays completely different
			// values in the expanded view of a `console.log(components)` entry vs the collapsed view.
			const reordered = structuredClone(
				arrayMove(components, Number(active.id), Number(over.id)),
			);
			for (let i = 0; i < reordered.length; i++) {
				const item = reordered[i]!;
				const isDifferent = item.order !== i;
				if (isDifferent) {
					item.order = i;
					if (item.diff === "none") {
						item.diff = "reordered";
					}
				}
			}
			setComponents(reordered);
		}
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
			<SortableContext items={ids} strategy={verticalListSortingStrategy}>
				<div className="flex flex-col gap-2">
					{props.components.map((component, i) => (
						<Component
							key={component.id}
							id={i.toString()}
							component={component}
							onClick={props.onComponentClicked}
						/>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}

interface ComponentProps {
	id: string;
	component: ComponentUI;
	onClick: (index: number) => void;
}
function Component(props: ComponentProps) {
	const { components, originalComponents, setComponents } = usePageEditor();

	function restore(component: ComponentUI) {
		const original = originalComponents.find((comp) => comp.id === component.id)!;
		const componentsCopy = [...components];
		componentsCopy.splice(componentsCopy.indexOf(component), 1, original);
		setComponents(componentsCopy);
	}
	function remove(component: ComponentUI) {
		const componentsCopy = [...components];
		componentsCopy.splice(componentsCopy.indexOf(component), 1, {
			...component,
			diff: "deleted",
		});
		setComponents(componentsCopy);
	}
	function unRemove(component: ComponentUI) {
		const componentsCopy = [...components];
		componentsCopy.splice(componentsCopy.indexOf(component), 1, {
			...component,
			diff: "none",
		});
		setComponents(componentsCopy);
	}
	function unAdd(component: ComponentUI) {
		setComponents(components.filter((comp) => comp.id !== component.id));
	}

	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: props.id,
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

	const diffStyle: Record<Exclude<Diff, "reordered" | "none">, string> = {
		added: "border-l-green-500",
		edited: "border-l-brand",
		deleted: "border-l-red-500",
	};

	return (
		<Card
			key={props.component.id}
			ref={setNodeRef}
			style={style}
			className={cn(
				props.component.diff !== "none" &&
					props.component.diff !== "reordered" &&
					`border-l-[3px] ${diffStyle[props.component.diff]}`,
				"flex-row items-center gap-3 shadow-none transition-colors md:p-4",
				props.component.diff !== "deleted" && "cursor-pointer hover:bg-accent/70",
			)}
			onClick={() =>
				props.component.diff === "deleted"
					? undefined
					: props.onClick(props.component.order)
			}
			aria-disabled={props.component.diff === "deleted"}
		>
			<div className="flex items-center gap-2">
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
				<span className="font-medium">{props.component.definition.name}</span>
			</div>

			<Actions
				diff={props.component.diff}
				restoreComponent={() => restore(props.component)}
				deleteComponent={() => remove(props.component)}
				unDeleteComponent={() => unRemove(props.component)}
				unAddComponent={() => unAdd(props.component)}
			/>
		</Card>
	);
}

interface ActionsProps {
	diff: Diff;
	restoreComponent: () => void;
	deleteComponent: () => void;
	unDeleteComponent: () => void;
	unAddComponent: () => void;
}
function Actions(props: ActionsProps) {
	function handleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, cb: () => void) {
		e.stopPropagation();
		cb();
	}

	switch (props.diff) {
		case "edited": {
			return (
				<div className="ml-auto flex items-center justify-center">
					<ActionIcon
						variant={"simple"}
						onClick={(e) => handleClick(e, props.restoreComponent)}
						tooltip="Restore"
					>
						<ArrowUturnLeftIcon className="w-5" data-testid="restore-component-btn" />
					</ActionIcon>
				</div>
			);
		}
		case "deleted": {
			return (
				<div className="ml-auto flex items-center justify-center">
					<ActionIcon
						variant={"simple"}
						onClick={(e) => handleClick(e, props.unDeleteComponent)}
						tooltip="Restore"
					>
						<ArrowUturnLeftIcon className="w-5" data-testid="restore-component-btn" />
					</ActionIcon>
				</div>
			);
		}

		case "added":
		case "reordered":
		case "none": {
			return (
				<div className="ml-auto flex items-center justify-center">
					<ActionIcon
						variant={"simple"}
						onClick={(e) =>
							handleClick(
								e,
								props.diff === "added"
									? props.unAddComponent
									: props.deleteComponent,
							)
						}
						tooltip="Delete"
					>
						<TrashIcon
							className="w-5 text-destructive/75 hover:text-destructive"
							data-testid="delete-component-btn"
						/>
					</ActionIcon>
				</div>
			);
		}
	}
}
