import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconGripVertical } from "@tabler/icons-react";
import {
	ArrowRightIcon,
	ArrowUturnLeftIcon,
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
import type { ComponentFieldDefinition } from "@prisma/client";
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
import {
	FieldTypePicker,
	fieldDefinitionUISchema,
	fieldTypeMap,
	type FieldDefinitionUI,
} from "./shared";

interface AddFieldDefsProps extends FormFieldProps<FieldDefinitionUI[]> {
	anyEditing: boolean;
}
export const AddFieldDefs = React.forwardRef<React.ComponentRef<"div">, AddFieldDefsProps>(
	(props, ref) => {
		const form = useForm<FieldDefinitionUI>({
			resolver: zodResolver(fieldDefinitionUISchema.omit({ id: true, diff: true })),
		});
		const onSubmit: SubmitHandler<FieldDefinitionUI> = (data) => {
			props.onChange([...props.value, { ...data, diff: "added" }]);
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
									<FieldTypePicker
										className="rounded-l-none border-l-0"
										{...field}
									/>
								</FormControl>
								<FormError />
							</FormItem>
						)}
					/>
				</div>

				<Button
					variant={"secondary"}
					disabled={!form.formState.isValid || props.anyEditing}
					onClick={() => onSubmit(form.getValues())}
				>
					Add
				</Button>
			</div>
		);
	},
);
AddFieldDefs.displayName = "AddFieldDefs";

type FieldDefsProps = FormFieldProps<FieldDefinitionUI[]> & {
	anyEditing: boolean;
	setAnyEditing: (value: boolean) => void;
} & (
		| {
				dialogType: "add";
		  }
		| {
				dialogType: "edit";
				originalFields: ComponentFieldDefinition[];
		  }
	);
export const FieldDefs = React.forwardRef<React.ComponentRef<"div">, FieldDefsProps>((props, _) => {
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
	function onEditSubmit(before: FieldDefinitionUI, after: FieldDefinitionUI) {
		props.onChange(
			props.value.map((field) => {
				if (field === before) {
					if (props.dialogType === "edit") {
						const original = props.originalFields.find((of) => of.id === field.id)!;
						return original.name === after.name && original.type === after.type
							? { ...after, diff: undefined }
							: { ...after, diff: "edited" };
					} else {
						return after;
					}
				} else {
					return field;
				}
			}),
		);
		props.setAnyEditing(false);
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
						anyEditing={props.anyEditing}
						diff={props.dialogType === "edit" ? field.diff : undefined}
						original={
							props.dialogType === "edit"
								? props.originalFields.find((of) => of.id === field.id)!
								: undefined
						}
						onEditBegin={() => props.setAnyEditing(true)}
						onEditSubmit={onEditSubmit}
						onEditCancel={() => props.setAnyEditing(false)}
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
	field: FieldDefinitionUI;
	anyEditing: boolean;
	diff?: FieldDefinitionUI["diff"];
	original?: ComponentFieldDefinition;

	onEditBegin: () => void;
	onEditSubmit: (beforeEdit: FieldDefinitionUI, afterEdit: FieldDefinitionUI) => void;
	onEditCancel: () => void;
	onDelete: (toDelete: FieldDefinitionUI) => void;
}
function FieldDef(props: FieldDefProps) {
	const [isEditing, setIsEditing] = React.useState(false);
	const form = useForm<FieldDefinitionUI>({
		// Must set `values` instead of `defaultValues` because after reordering, the old values were kept
		values: props.field,
	});
	const onSubmit: SubmitHandler<FieldDefinitionUI> = (data) => {
		props.onEditSubmit(props.field, data);
		setIsEditing(false);
	};
	const diffColor: Record<NonNullable<typeof props.diff>, string> = {
		added: "border-l-green-500",
		edited: "border-l-yellow-500",
		deleted: "border-l-red-500",
	};
	function cancel() {
		setIsEditing(false);
		props.onEditCancel();
		form.reset();
	}

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

	return (
		<Card
			ref={setNodeRef}
			style={style}
			className={cn(
				"group flex-row gap-4 md:p-3",
				props.diff && `border-l-[3px] ${diffColor[props.diff]}`,
			)}
		>
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
				{!isEditing && props.diff === "edited" && (
					<ActionIcon
						variant={"simple"}
						className="mr-0.5"
						onClick={() => props.onEditSubmit(props.field, props.original!)}
					>
						<ArrowUturnLeftIcon className="w-5" />
					</ActionIcon>
				)}

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
