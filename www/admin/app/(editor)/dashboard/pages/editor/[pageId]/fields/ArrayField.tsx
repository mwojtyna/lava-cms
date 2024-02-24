import {
	useSensors,
	useSensor,
	PointerSensor,
	KeyboardSensor,
	type DragEndEvent,
	DndContext,
	closestCenter,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
	sortableKeyboardCoordinates,
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PlusIcon, TrashIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { createId } from "@paralleldrive/cuid2";
import { IconGripVertical } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { ActionIcon } from "@/src/components/ui/client/ActionIcon";
import { Button } from "@/src/components/ui/client/Button";
import { Card } from "@/src/components/ui/server/Card";
import {
	type ComponentUI,
	usePageEditorStore,
	type ArrayItemUI,
} from "@/src/data/stores/pageEditor";
import { getInitialValue } from "@/src/data/stores/utils";
import { cn } from "@/src/utils/styling";
import { type FieldProps, Field } from "../ComponentEditor";
import { createComponentInstance, AddComponentDialog } from "../dialogs/AddComponentDialog";
import { NestedComponentField } from "./NestedComponentField";

interface ArrayFieldProps {
	parentField: FieldProps["field"];
	parentComponent: ComponentUI;
}
export function ArrayField(props: ArrayFieldProps) {
	const { originalArrayItems, arrayItems, setArrayItems, setNestedComponents } =
		usePageEditorStore((state) => ({
			originalArrayItems: state.originalArrayItems,
			arrayItems: state.arrayItems,
			setArrayItems: state.setArrayItems,
			setNestedComponents: state.setNestedComponents,
		}));
	const myArrayItems = useMemo(
		() => arrayItems[props.parentField.id] ?? [],
		[arrayItems, props.parentField.id],
	);
	const myOriginalArrayItems = useMemo(
		() => originalArrayItems[props.parentField.id] ?? [],
		[originalArrayItems, props.parentField.id],
	);

	const [dialogOpen, setDialogOpen] = useState(false);

	const dndIds: string[] = useMemo(
		// For some reason id cannot be 0, even though it's a string
		() => myArrayItems.map((_, i) => (i + 1).toString()),
		[myArrayItems],
	);
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	function addItem() {
		if (props.parentField.arrayItemType !== "COMPONENT") {
			const lastItem = myArrayItems.at(-1);
			setArrayItems(props.parentField.id, [
				...myArrayItems,
				{
					id: createId(),
					data: getInitialValue(props.parentField.arrayItemType!) as string,
					parentFieldId: props.parentField.id,
					order: lastItem ? lastItem.order + 1 : 0,
					diff: "added",
					reordered: false,
				},
			]);
		} else {
			setDialogOpen(true);
		}
	}
	function handleReorder(e: DragEndEvent) {
		const { over, active } = e;
		if (over && active.id !== over.id) {
			const reordered = structuredClone(
				arrayMove(myArrayItems, Number(active.id) - 1, Number(over.id) - 1),
			);
			for (let i = 0; i < reordered.length; i++) {
				const item = reordered[i]!;
				if (item.order !== i) {
					item.order = i;
					item.reordered = true;
				}
			}

			setArrayItems(props.parentField.id, reordered);
		}
	}

	async function addComponent(compDefId: string) {
		const newItemId = createId();
		const newComponent = await createComponentInstance(compDefId, {
			order: 0,
			pageId: props.parentComponent.pageId,
			parentFieldId: null,
			parentArrayItemId: newItemId,
		});
		setNestedComponents((nestedComponents) => [...nestedComponents, newComponent]);

		const lastItem = myArrayItems.at(-1);
		setArrayItems(props.parentField.id, [
			...myArrayItems,
			{
				id: newItemId,
				data: "",
				parentFieldId: props.parentField.id,
				order: lastItem ? lastItem.order + 1 : 0,
				diff: "added",
				reordered: true,
			},
		]);
	}

	return (
		<Card className="gap-3 md:p-4 md:px-3">
			<DndContext
				// https://github.com/clauderic/dnd-kit/issues/926#issuecomment-1640115665
				id={"id"}
				sensors={sensors}
				collisionDetection={closestCenter}
				modifiers={[
					props.parentField.arrayItemType !== "TEXT"
						? restrictToParentElement
						: restrictToVerticalAxis,
				]}
				onDragEnd={handleReorder}
			>
				<SortableContext items={dndIds} strategy={verticalListSortingStrategy}>
					{myArrayItems.length > 0 && (
						<div className="flex flex-col gap-2">
							{myArrayItems.map((item, i) => (
								<ArrayFieldItem
									key={item.id}
									dndId={dndIds[i]!}
									item={item}
									items={myArrayItems}
									originalItems={myOriginalArrayItems}
									parentField={props.parentField}
									parentComponent={props.parentComponent}
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
				onClick={addItem}
			>
				Add item
			</Button>

			{props.parentField.arrayItemType === "COMPONENT" && (
				<AddComponentDialog
					open={dialogOpen}
					setOpen={setDialogOpen}
					onSubmit={addComponent}
				/>
			)}
		</Card>
	);
}

interface ArrayFieldItemProps {
	dndId: string;
	item: ArrayItemUI;
	items: ArrayItemUI[];
	originalItems: ArrayItemUI[];
	parentField: FieldProps["field"];
	parentComponent: ComponentUI;
}
function ArrayFieldItem(props: ArrayFieldItemProps) {
	const { setArrayItems } = usePageEditorStore((state) => ({
		setArrayItems: state.setArrayItems,
	}));

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

	function handleChange(value: string) {
		setArrayItems(
			props.parentField.id,
			props.items.map((item) => {
				if (item.id === props.item.id) {
					let diff = item.diff;
					if (item.diff !== "added") {
						// Setting to 'replaced' is a hack to force the item to not be reset to 'none',
						// because a replaced nested component has the same id as the original,
						// which means the array item will differ only by the diff property,
						// so it will reset to 'none' (if diff is 'edited').
						diff =
							props.parentField.arrayItemType !== "COMPONENT" ? "edited" : "replaced";
					}

					if (props.parentField.arrayItemType === "COMPONENT") {
						return {
							...item,
							parentFieldId: props.parentField.id,
							diff,
						};
					} else {
						return {
							...item,
							data: value,
							diff,
						};
					}
				} else {
					return item;
				}
			}),
		);
	}
	function handleRestore() {
		const original = props.originalItems.find((i) => i.id === props.item.id)!;
		setArrayItems(
			props.parentField.id,
			props.items.map((item) =>
				item.id === props.item.id
					? {
							...original,
							reordered: props.item.reordered,
					  }
					: item,
			),
		);
	}
	function handleUnAdd() {
		setArrayItems(
			props.parentField.id,
			props.items.filter((item) => props.item.id !== item.id),
		);
	}
	function handleRemove() {
		setArrayItems(
			props.parentField.id,
			props.item.diff === "added"
				? props.items.filter((item) => item.id !== props.item.id)
				: props.items.map((item) =>
						item.id === props.item.id ? { ...item, diff: "deleted" } : item,
				  ),
		);
	}
	function handleUnRemove() {
		setArrayItems(
			props.parentField.id,
			props.items.map((item) =>
				item.id === props.item.id ? { ...item, diff: "none" } : item,
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

			<div className="w-full bg-card">
				{props.parentField.arrayItemType !== "COMPONENT" ? (
					<Field
						className={cn(
							"rounded-md",
							props.parentField.arrayItemType === "SWITCH" && "h-5 w-5",
							props.item.diff === "added" && "bg-green-400/10",
							props.item.diff === "deleted" && "bg-red-400/10",
						)}
						component={props.parentComponent}
						field={{
							id: props.item.id,
							type: props.parentField.arrayItemType!,
							arrayItemType: null,
						}}
						value={props.item.data}
						onChange={handleChange}
						edited={props.item.diff === "edited" || props.item.diff === "replaced"}
						onRestore={handleRestore}
					/>
				) : (
					// If the array item is a component, on top of setting the component's diff, we also mirror that diff to the array item's diff
					<NestedComponentField
						onChange={handleChange}
						parentFieldId={null}
						parentArrayItemId={props.item.id}
						pageId={props.parentComponent.pageId}
						edited={props.item.diff === "edited" || props.item.diff === "replaced"}
						onRestore={handleRestore}
						onUnAdd={handleUnAdd}
						onRemove={handleRemove}
						onUnRemove={handleUnRemove}
					/>
				)}
			</div>

			{props.parentField.arrayItemType !== "COMPONENT" &&
				(props.item.diff !== "deleted" ? (
					<ActionIcon variant={"simple"} tooltip="Delete" onClick={handleRemove}>
						<TrashIcon className="w-5 text-destructive" />
					</ActionIcon>
				) : (
					<ActionIcon variant={"simple"} tooltip="Restore" onClick={handleUnRemove}>
						<ArrowUturnLeftIcon className="w-5" />
					</ActionIcon>
				))}
		</div>
	);
}
