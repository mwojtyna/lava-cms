import {
	useSensors,
	useSensor,
	PointerSensor,
	KeyboardSensor,
	DndContext,
	closestCenter,
	type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
	sortableKeyboardCoordinates,
	SortableContext,
	verticalListSortingStrategy,
	useSortable,
	arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	ArrowPathRoundedSquareIcon,
	ArrowUturnLeftIcon,
	PlusIcon,
	TrashIcon,
} from "@heroicons/react/24/outline";
import { createId } from "@paralleldrive/cuid2";
import { IconGripVertical } from "@tabler/icons-react";
import { useState, useMemo, useRef } from "react";
import { ActionIcon, Button } from "@/src/components/ui/client";
import { Card } from "@/src/components/ui/server";
import { type ComponentUI, usePageEditor, type ArrayItemUI } from "@/src/data/stores/pageEditor";
import { cn } from "@/src/utils/styling";
import { trpcFetch } from "@/src/utils/trpc";
import { Field, type FieldProps } from "./ComponentEditor";
import { ComponentCard } from "./Components";
import { AddComponentDialog } from "./dialogs/AddComponentDialog";

interface NestedComponentFieldProps {
	component: ComponentUI;
	edited: boolean;
	value: string;
	onChange: (id: string, nestedComponents: ComponentUI[]) => void;
}
export function NestedComponentField(props: NestedComponentFieldProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const { steps, setSteps, originalNestedComponents, nestedComponents, setNestedComponents } =
		usePageEditor();

	const currentComponent = useMemo(
		() => nestedComponents.find((comp) => comp.id === props.value),
		[nestedComponents, props.value],
	);
	const originalComponent = useMemo(
		() => originalNestedComponents.find((comp) => comp.id === props.value),
		[originalNestedComponents, props.value],
	);

	async function selectComponent(id: string) {
		const definition = await trpcFetch.components.getComponentDefinition.query({ id });
		const newComponent: ComponentUI = {
			// When replacing component, keep the id
			id: currentComponent?.id ?? createId(),
			definition: {
				id: definition.id,
				name: definition.name,
			},
			fields: definition.field_definitions.map((fieldDef) => ({
				id: createId(),
				name: fieldDef.name,
				data: "",
				definitionId: fieldDef.id,
				order: fieldDef.order,
				type: fieldDef.type,
				arrayItemType: fieldDef.array_item_type,
			})),
			order: 0,
			pageId: props.component.pageId,
			parentComponentId: props.component.id,
			diff: currentComponent ? "replaced" : "added",
		};

		props.onChange(
			newComponent.id,
			currentComponent
				? nestedComponents.map((nc) => (nc.id === currentComponent.id ? newComponent : nc))
				: [...nestedComponents, newComponent],
		);
	}

	function restore() {
		props.onChange(
			originalComponent!.id,
			nestedComponents.map((c) => (c.id === originalComponent!.id ? originalComponent! : c)),
		);
	}
	function remove(component: ComponentUI) {
		setNestedComponents(
			nestedComponents.map((c) => (c.id === component.id ? { ...c, diff: "deleted" } : c)),
		);
	}
	function unRemove(component: ComponentUI) {
		setNestedComponents(
			nestedComponents.map((c) => (c.id === component.id ? { ...c, diff: "none" } : c)),
		);
	}
	function unAdd(component: ComponentUI) {
		props.onChange(
			"",
			nestedComponents.filter((c) => c.id !== component.id),
		);
	}

	return (
		<>
			{currentComponent && (
				<div className="grid grid-flow-col grid-cols-[1fr_auto] gap-2">
					<ComponentCard
						dndId="0"
						noDrag
						component={{
							id: currentComponent.id,
							name: currentComponent.definition.name,
							diff: currentComponent.diff,
						}}
						onClick={() =>
							setSteps([
								...steps,
								{
									name: "edit-nested-component",
									nestedComponentId: currentComponent.id,
								},
							])
						}
						extraActions={
							currentComponent.diff !== "added" &&
							currentComponent.diff !== "deleted" && (
								<ActionIcon
									className="mx-1"
									variant={"simple"}
									tooltip="Change"
									onClick={(e) => {
										e.stopPropagation();
										setDialogOpen(true);
									}}
								>
									<ArrowPathRoundedSquareIcon className="w-5" />
								</ActionIcon>
							)
						}
						onRestore={restore}
						onRemove={() => remove(currentComponent)}
						onUnRemove={() => unRemove(currentComponent)}
						onUnAdd={() => unAdd(currentComponent)}
					/>
				</div>
			)}
			{!currentComponent && (
				<Button variant={"outline"} onClick={() => setDialogOpen(true)}>
					Select component
				</Button>
			)}

			<AddComponentDialog
				open={dialogOpen}
				setOpen={setDialogOpen}
				onSubmit={selectComponent}
			/>
		</>
	);
}

interface ArrayFieldProps {
	parentField: FieldProps["field"];
	component: ComponentUI;
}
export function ArrayField(props: ArrayFieldProps) {
	const { arrayItems, setArrayItems } = usePageEditor();
	const myArrayItems = useMemo(
		() => arrayItems.filter((item) => item.parentFieldId === props.parentField.id),
		[arrayItems, props.parentField.id],
	);

	const dndIds: string[] = useMemo(
		() => myArrayItems.map((_, i) => i.toString()),
		[myArrayItems],
	);
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	function addArrayItem() {
		const lastItem = myArrayItems.at(-1);
		setArrayItems([
			...arrayItems,
			{
				id: createId(),
				data: "",
				parentFieldId: props.parentField.id,
				order: lastItem ? lastItem.order + 1 : 0,
				diff: "added",
			},
		]);
	}
	function handleReorder(e: DragEndEvent) {
		const { over, active } = e;
		if (over && active.id !== over.id) {
			const reordered: ArrayItemUI[] = arrayMove(
				myArrayItems,
				Number(active.id),
				Number(over.id),
			);
			for (let i = 0; i < reordered.length; i++) {
				const item = reordered[i]!;
				if (item.order !== i) {
					item.order = i;
					if (item.diff === "none") {
						item.diff = "reordered";
					}
				}
			}

			setArrayItems(
				arrayItems
					.filter((item) => !reordered.find((i) => i.id === item.id))
					.concat(reordered),
			);
		}
	}

	return (
		<Card className="gap-3 md:p-4 md:px-3">
			<DndContext
				// https://github.com/clauderic/dnd-kit/issues/926#issuecomment-1640115665
				id={"id"}
				sensors={sensors}
				collisionDetection={closestCenter}
				modifiers={[restrictToParentElement]}
				onDragEnd={handleReorder}
			>
				<SortableContext items={dndIds} strategy={verticalListSortingStrategy}>
					{myArrayItems.length > 0 && (
						<div className="flex flex-col gap-2">
							{myArrayItems.map((item, i) => (
								<ArrayFieldItem
									key={i}
									dndId={i.toString()}
									item={item}
									parentField={props.parentField}
									component={props.component}
								/>
							))}
						</div>
					)}
				</SortableContext>
			</DndContext>

			<Button
				className="w-full"
				variant={"outline"}
				icon={<PlusIcon className="w-5" />}
				onClick={addArrayItem}
			>
				Add item
			</Button>
		</Card>
	);
}

interface ArrayFieldItemProps {
	dndId: string;
	item: ArrayItemUI;
	parentField: FieldProps["field"];
	component: ComponentUI;
}
function ArrayFieldItem(props: ArrayFieldItemProps) {
	const { originalArrayItems, arrayItems, setArrayItems } = usePageEditor();

	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: props.dndId,
		// We have no stable unique property to use as id, so we have to disable this
		// or the list will reshuffle on drop
		// https://github.com/clauderic/dnd-kit/issues/767#issuecomment-1140556346
		animateLayoutChanges: () => false,
		disabled: props.item.diff === "deleted",
	});
	const style: React.CSSProperties = {
		transform: CSS.Translate.toString(transform),
		transition,
		zIndex: isDragging ? 1 : undefined,
	};

	const preDeletedDiff = useRef<ArrayItemUI["diff"]>(props.item.diff);

	function handleChange(value: string) {
		setArrayItems(
			arrayItems.map((item) =>
				item.id === props.item.id
					? {
							...item,
							data: value,
							diff: item.diff !== "added" ? "edited" : item.diff,
					  }
					: item,
			),
		);
	}
	function handleRestore() {
		setArrayItems(
			arrayItems.map((item) =>
				item.id === props.item.id
					? originalArrayItems.find((i) => i.id === item.id)!
					: item,
			),
		);
	}
	function handleDelete() {
		preDeletedDiff.current = props.item.diff;
		setArrayItems(
			props.item.diff === "added"
				? arrayItems.filter((item) => item.id !== props.item.id)
				: arrayItems.map((item) =>
						item.id === props.item.id ? { ...item, diff: "deleted" } : item,
				  ),
		);
	}
	function handleUnDelete() {
		setArrayItems(
			arrayItems.map((item) =>
				item.id === props.item.id ? { ...item, diff: preDeletedDiff.current } : item,
			),
		);
	}

	return (
		<div ref={setNodeRef} className={cn("flex items-center gap-2")} style={style}>
			<div {...attributes} {...listeners}>
				<IconGripVertical
					className={cn(
						"w-5 cursor-move text-muted-foreground",
						props.item.diff === "deleted" && "cursor-auto text-muted-foreground/50",
					)}
				/>
			</div>

			<div
				className={cn(
					"w-full rounded-md",
					props.item.diff === "added" && "bg-green-500/10",
					props.item.diff === "deleted" && "bg-red-500/10",
				)}
			>
				{/* TODO: Fix other field types */}
				<Field
					value={props.item.data}
					onChange={handleChange}
					component={props.component}
					field={{
						id: props.item.id,
						type: props.parentField.arrayItemType!,
						arrayItemType: null,
					}}
					edited={props.item.diff === "edited"}
					onRestore={handleRestore}
				/>
			</div>

			{props.item.diff !== "deleted" ? (
				<ActionIcon variant={"simple"} tooltip="Delete" onClick={handleDelete}>
					<TrashIcon className="w-5 text-destructive" />
				</ActionIcon>
			) : (
				<ActionIcon variant={"simple"} tooltip="Restore" onClick={handleUnDelete}>
					<ArrowUturnLeftIcon className="w-5" />
				</ActionIcon>
			)}
		</div>
	);
}
