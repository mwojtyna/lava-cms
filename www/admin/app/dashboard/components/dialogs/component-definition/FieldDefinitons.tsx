import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconGripVertical } from "@tabler/icons-react";
import {
	ArrowRightIcon,
	PencilSquareIcon,
	TrashIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { ComponentFieldDefinitionSchema } from "@admin/prisma/generated/zod";
import {
	FormField,
	FormItem,
	FormControl,
	Input,
	FormError,
	Button,
	ActionIcon,
	type FormFieldProps,
} from "@admin/src/components/ui/client";
import { Card, TypographyMuted } from "@admin/src/components/ui/server";
import { cn } from "@admin/src/utils/styling";
import { FieldTypePicker, fieldTypeMap } from "./shared";

export const fieldDefinitionSchema = z.object({
	name: z.string().nonempty(),
	type: ComponentFieldDefinitionSchema.shape.type,
});
export type FieldDefinition = z.infer<typeof fieldDefinitionSchema>;

export const AddFieldDefs = React.forwardRef<
	React.ComponentRef<"div">,
	FormFieldProps<FieldDefinition[]>
>((props, ref) => {
	const form = useForm<FieldDefinition>({
		resolver: zodResolver(fieldDefinitionSchema),
	});
	const onSubmit: SubmitHandler<FieldDefinition> = (data) => {
		props.onChange([...props.value, data]);
	};

	return (
		<div ref={ref} className="flex gap-2">
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
							<FormError />
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
							<FormError />
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
});
AddFieldDefs.displayName = "AddFieldDefs";

interface FieldDefsProps extends FormFieldProps<FieldDefinition[]> {
	dialogType: "add" | "edit";
}
export const FieldDefs = React.forwardRef<React.ComponentRef<"div">, FieldDefsProps>((props, _) => {
	const [anyEditing, setAnyEditing] = React.useState(false);

	const ids: string[] = React.useMemo(
		() => props.value.map((_, i) => i.toString()),
		[props.value],
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
			props.onChange(arrayMove(props.value, Number(active.id), Number(over.id)));
		}
	}

	return props.value.length > 0 ? (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			modifiers={[restrictToParentElement]}
			onDragEnd={reorder}
		>
			<SortableContext items={ids} strategy={verticalListSortingStrategy}>
				{props.value.map((field, i) => (
					<FieldDef
						key={i}
						id={i.toString()}
						field={field}
						anyEditing={anyEditing}
						onEditBegin={() => setAnyEditing(true)}
						onEditSubmit={(before, after) => {
							props.onChange(
								props.value.map((field) => (field === before ? after : field)),
							);
							setAnyEditing(false);
						}}
						onEditCancel={() => setAnyEditing(false)}
						onDelete={(toDelete) =>
							props.onChange(props.value.filter((field) => field !== toDelete))
						}
					/>
				))}
			</SortableContext>
		</DndContext>
	) : (
		<TypographyMuted>No fields added</TypographyMuted>
	);
});
FieldDefs.displayName = "FieldDefs";

interface FieldDefProps {
	id: string;
	field: FieldDefinition;
	anyEditing: boolean;
	onEditBegin: () => void;
	onEditSubmit: (beforeEdit: FieldDefinition, afterEdit: FieldDefinition) => void;
	onEditCancel: () => void;
	onDelete: (toDelete: FieldDefinition) => void;
}
function FieldDef(props: FieldDefProps) {
	const [isEditing, setIsEditing] = React.useState(false);
	const form = useForm<FieldDefinition>({
		// Must set `values` instead of `defaultValues` because after reordering, the old values were kept
		values: props.field,
	});
	const onSubmit: SubmitHandler<FieldDefinition> = (data) => {
		props.onEditSubmit(props.field, data);
		setIsEditing(false);
	};

	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: props.id,
		// We have no stable unique property to use as id, so we have to disable this
		// or the list will reshuffle on drop
		// https://github.com/clauderic/dnd-kit/issues/767#issuecomment-1140556346
		animateLayoutChanges: () => false,
		disabled: props.anyEditing,
	});
	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 1 : undefined,
	};
	function cancel() {
		setIsEditing(false);
		props.onEditCancel();
		form.reset();
	}

	return (
		<Card ref={setNodeRef} style={style} className={cn("group flex-row gap-4 md:p-3")}>
			<div className="flex items-center gap-3">
				<div {...attributes} {...listeners}>
					<IconGripVertical
						className={cn(
							"w-5 cursor-move text-muted-foreground",
							props.anyEditing && "cursor-auto text-muted-foreground/50",
						)}
					/>
				</div>

				{isEditing ? (
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input
										inputClassName="-ml-1 px-1 py-0 h-fit text-base text-left rounded-sm max-w-[150px]"
										onKeyDown={async (e) => {
											if (e.key === "Escape") {
												e.preventDefault();
												cancel();
											} else if (e.key === "Enter") {
												e.preventDefault();
												await form.handleSubmit(onSubmit)();
											}
										}}
										autoFocus
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				) : (
					<span className="max-w-[17ch] overflow-auto whitespace-nowrap font-medium">
						{props.field.name}
					</span>
				)}

				{isEditing ? (
					<FormField
						control={form.control}
						name="type"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<FieldTypePicker
										className="h-fit rounded-sm px-1 py-0.5 [&>svg]:ml-0"
										onKeyDown={(e) => {
											if (e.key === "Escape") {
												e.preventDefault();
												cancel();
											}
										}}
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				) : (
					<span className="text-sm">{fieldTypeMap[props.field.type]}</span>
				)}
			</div>

			<div
				className={cn(
					"ml-auto flex items-center gap-2 text-sm transition-opacity",
					!isEditing && props.anyEditing && "pointer-events-none opacity-0",
				)}
			>
				{isEditing ? (
					<>
						<ActionIcon
							variant={"simple"}
							onClick={() => form.handleSubmit(onSubmit)()}
						>
							<ArrowRightIcon className="w-5" />
						</ActionIcon>

						<ActionIcon variant={"simple"} onClick={cancel}>
							<XMarkIcon className="w-5" />
						</ActionIcon>
					</>
				) : (
					<>
						<ActionIcon
							variant={"simple"}
							className={cn(isEditing && "text-foreground")}
							onClick={() => {
								setIsEditing(true);
								props.onEditBegin();
							}}
						>
							<PencilSquareIcon className="w-5" />
						</ActionIcon>

						<ActionIcon
							variant={"simple"}
							className="text-destructive/75 hover:text-destructive"
							onClick={() => props.onDelete(props.field)}
						>
							<TrashIcon className="w-5" />
						</ActionIcon>
					</>
				)}
			</div>
		</Card>
	);
}
