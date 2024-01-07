import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowUturnLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconGripVertical } from "@tabler/icons-react";
import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
	FormField,
	FormItem,
	FormControl,
	Input,
	Button,
	ActionIcon,
} from "@/src/components/ui/client";
import { Card, TypographyMuted } from "@/src/components/ui/server";
import { useComponentsTableDialogs } from "@/src/data/stores/componentDefinitions";
import { cn } from "@/src/utils/styling";
import {
	FieldTypePicker,
	fieldDefinitionUISchema,
	fieldTypeMap,
	type FieldDefinitionUI,
} from "./shared";

export function AddFieldDefs() {
	const { fields, setFields } = useComponentsTableDialogs();

	const form = useForm<FieldDefinitionUI>({
		resolver: zodResolver(fieldDefinitionUISchema.omit({ id: true, diff: true })),
	});
	const onSubmit: SubmitHandler<FieldDefinitionUI> = (data) => {
		setFields([...fields, { ...data, diff: "added" }]);
	};

	return (
		<div className="flex gap-2" data-testid="add-field-definition">
			<div className="grid grid-cols-2">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input
									inputClassName="rounded-r-none"
									placeholder="Name"
									onKeyDown={async (e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											await form.handleSubmit(onSubmit)();
										}
									}}
									aria-required
									{...field}
								/>
							</FormControl>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="type"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<FieldTypePicker className="rounded-l-none border-l-0" {...field} />
							</FormControl>
						</FormItem>
					)}
				/>
			</div>

			<Button
				variant={"secondary"}
				disabled={!form.formState.isValid}
				onClick={() => onSubmit(form.getValues())}
			>
				Add
			</Button>
		</div>
	);
}

interface FieldDefsProps {
	dialogType: "add" | "edit";
}
export const FieldDefs = React.forwardRef<React.ComponentRef<"div">, FieldDefsProps>((props, _) => {
	const { fields, setFields } = useComponentsTableDialogs();

	const ids: string[] = React.useMemo(() => fields.map((_, i) => i.toString()), [fields]);
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);
	function reorder(e: DragEndEvent) {
		const { active, over } = e;
		if (over && active.id !== over.id) {
			const activeId = Number(active.id);
			const overId = Number(over.id);

			let newFields = structuredClone(fields);

			const activeField = newFields[activeId]!;
			const overField = newFields[overId]!;
			if (activeField.diff === "none") {
				activeField.diff = "reordered";
			}
			if (overField.diff === "none") {
				overField.diff = "reordered";
			}

			newFields = arrayMove(newFields, activeId, overId);
			setFields(newFields);
		}
	}

	function onDelete(toDelete: FieldDefinitionUI) {
		let newFields: FieldDefinitionUI[] = [];

		if (props.dialogType === "add") {
			newFields = fields.filter((field) => field !== toDelete);
		} else if (props.dialogType === "edit") {
			if (toDelete.diff === "added") {
				newFields = fields.filter((field) => field !== toDelete);
			} else {
				newFields = fields.map((field) => {
					if (field !== toDelete) {
						return field;
					}
					return {
						...field,
						diff: "deleted",
					};
				});
			}
		}

		setFields(newFields);
	}
	function onUnDelete(toUnDelete: FieldDefinitionUI) {
		const newFields: FieldDefinitionUI[] = fields.map((field) =>
			field === toUnDelete
				? {
						...field,
						diff: "none",
				  }
				: field,
		);
		setFields(newFields);
	}

	return fields.length > 0 ? (
		<div className="flex flex-col gap-2" data-testid="component-fields">
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				modifiers={[restrictToParentElement]}
				onDragEnd={reorder}
			>
				<SortableContext items={ids} strategy={verticalListSortingStrategy}>
					{fields.map((field, i) => {
						const sharedProps: Omit<
							Extract<FieldDefProps, { dialogType: "add" }>,
							"dialogType"
						> = {
							dndId: i.toString(),
							field,
							onDelete,
						};

						return props.dialogType === "add" ? (
							<FieldDefCard key={i} dialogType={"add"} {...sharedProps} />
						) : (
							<FieldDefCard
								key={i}
								dialogType={"edit"}
								{...sharedProps}
								onUnDelete={onUnDelete}
							/>
						);
					})}
				</SortableContext>
			</DndContext>
		</div>
	) : (
		<TypographyMuted>No fields added</TypographyMuted>
	);
});
FieldDefs.displayName = "FieldDefs";

type FieldDefProps = {
	dndId: string;
	field: FieldDefinitionUI;
	onDelete: (toDelete: FieldDefinitionUI) => void;
} & (
	| {
			dialogType: "add";
	  }
	| {
			dialogType: "edit";
			onUnDelete: (toUnDelete: FieldDefinitionUI) => void;
	  }
);
function FieldDefCard(props: FieldDefProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: props.dndId,
		// We have no stable unique property to use as id, so we have to disable this
		// or the list will reshuffle on drop
		// https://github.com/clauderic/dnd-kit/issues/767#issuecomment-1140556346
		animateLayoutChanges: () => false,
		disabled: props.field.diff === "deleted",
	});
	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 1 : undefined,
	};

	type DiffType = FieldDefinitionUI["diff"];
	const diffStyle: Record<Exclude<DiffType, "none" | "reordered">, string> = {
		added: "border-l-green-500",
		edited: "border-l-brand",
		deleted: "border-l-red-500",
	};

	return (
		<Card
			ref={setNodeRef}
			style={style}
			className={cn(
				"group flex-row gap-4 md:p-3",
				props.dialogType === "edit" &&
					props.field.diff !== "none" &&
					props.field.diff !== "reordered" &&
					`border-l-[3px] ${diffStyle[props.field.diff]}`,
				props.field.diff !== "deleted" && "cursor-pointer hover:bg-accent/70",
			)}
			data-test-diff={props.dialogType === "edit" ? props.field.diff : undefined}
		>
			{/* Grip, name, type */}
			<div className="flex items-center gap-3">
				<div {...attributes} {...listeners}>
					<IconGripVertical
						className={cn(
							"w-5 cursor-move text-muted-foreground",
							props.field.diff === "deleted" &&
								"cursor-auto text-muted-foreground/50",
						)}
					/>
				</div>

				<span className="max-w-[17ch] overflow-auto whitespace-nowrap font-medium">
					{props.field.name}
				</span>

				<span className="text-sm">{fieldTypeMap[props.field.type]}</span>
			</div>

			{/* Actions */}
			<div className={cn("ml-auto flex items-center gap-2 text-sm transition-opacity")}>
				{props.dialogType === "edit" && props.field.diff === "deleted" && (
					<ActionIcon
						variant={"simple"}
						className="mr-0.5"
						onClick={() => props.onUnDelete(props.field)}
						tooltip="Restore"
					>
						<ArrowUturnLeftIcon className="w-5" data-testid="restore-field-btn" />
					</ActionIcon>
				)}

				{props.field.diff !== "edited" && props.field.diff !== "deleted" && (
					<ActionIcon
						variant={"simple"}
						className="text-destructive/75 hover:text-destructive"
						onClick={() => props.onDelete(props.field)}
						tooltip="Delete"
					>
						<TrashIcon className="w-5" data-testid="delete-field-btn" />
					</ActionIcon>
				)}
			</div>
		</Card>
	);
}
