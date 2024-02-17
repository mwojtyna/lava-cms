"use client";

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
import { createId } from "@paralleldrive/cuid2";
import { IconGripVertical } from "@tabler/icons-react";
import * as React from "react";
import { useForm, type SubmitHandler, FormProvider } from "react-hook-form";
import { z } from "zod";
import { ComponentFieldTypeSchema } from "@/prisma/generated/zod";
import { ActionIcon } from "@/src/components/ui/client/ActionIcon";
import { Button } from "@/src/components/ui/client/Button";
import { FormField, FormItem, FormControl, FormError } from "@/src/components/ui/client/Form";
import { Input } from "@/src/components/ui/client/Input";
import { Card } from "@/src/components/ui/server/Card";
import { TypographyMuted } from "@/src/components/ui/server/typography";
import { useComponentsTableDialogsStore } from "@/src/data/stores/componentDefinitions";
import { cn } from "@/src/utils/styling";
import { FieldTypePicker, fieldTypeMap, type FieldDefinitionUI, type DialogType } from "./shared";

const addFieldDefsSchema = z.object({
	name: z.string().min(1, { message: " " }),
	type: ComponentFieldTypeSchema,
});
type AddFieldDefsInputs = z.infer<typeof addFieldDefsSchema>;

export function AddFieldDefs() {
	const { fields, setFields } = useComponentsTableDialogsStore((state) => ({
		fields: state.fields,
		setFields: state.setFields,
	}));

	const form = useForm<AddFieldDefsInputs>({
		resolver: async (values, context, options) => {
			const zod = await zodResolver(addFieldDefsSchema)(values, context, options);
			if (fields.find((field) => field.diff !== "deleted" && field.name === values.name)) {
				return {
					...zod,
					errors: {
						...zod.errors,
						name: {
							type: "manual",
							message: `Field '${values.name}' already exists`,
						},
					},
				};
			} else {
				return zod;
			}
		},
		defaultValues: {
			type: "TEXT",
		},
		mode: "onChange",
	});
	const onSubmit: SubmitHandler<AddFieldDefsInputs> = (data) => {
		setFields((fields) => [
			...fields,
			{
				id: createId(),
				name: data.name,
				type: data.type,
				order: fields.length,
				arrayItemType: data.type === "COLLECTION" ? "TEXT" : null,
				diff: "added",
				reordered: false,
			},
		]);
		form.resetField("name");
	};

	// Don't know why, but we also need to check if there are any errors
	// otherwise the button is enabled even if it shouldn't be
	const isValid = form.formState.isValid && Object.keys(form.formState.errors).length === 0;

	return (
		<FormProvider {...form}>
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
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												if (isValid) {
													void form.handleSubmit(onSubmit)();
												}
											}
										}}
										aria-required
										{...field}
									/>
								</FormControl>
								<FormError className="whitespace-nowrap" />
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
							</FormItem>
						)}
					/>
				</div>

				<Button
					variant={"secondary"}
					disabled={!isValid}
					onClick={form.handleSubmit(onSubmit)}
				>
					Add
				</Button>
			</div>
		</FormProvider>
	);
}

interface FieldDefsProps {
	dialogType: DialogType;
	onFieldClick: (field: FieldDefinitionUI) => void;
}
export const FieldDefs = React.forwardRef<React.ComponentRef<"div">, FieldDefsProps>((props, _) => {
	const { fields, setFields, originalFields } = useComponentsTableDialogsStore((state) => ({
		fields: state.fields,
		setFields: state.setFields,
		originalFields: state.originalFields,
	}));

	const dndIds: string[] = React.useMemo(() => fields.map((_, i) => i.toString()), [fields]);
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
				arrayMove(fields, Number(active.id), Number(over.id)),
			);
			for (let i = 0; i < reordered.length; i++) {
				const item = reordered[i]!;
				if (item.order !== i) {
					item.order = i;
					item.reordered = true;
				}
			}

			setFields(reordered);
		}
	}

	function onRestore(toRestore: FieldDefinitionUI) {
		const original = originalFields.find((field) => field.id === toRestore.id)!;
		const restored = fields.map((field) =>
			field.id === toRestore.id
				? {
						...original,
						reordered: field.reordered,
				  }
				: field,
		);
		setFields(restored);
	}
	function onDelete(toDelete: FieldDefinitionUI) {
		let newFields: FieldDefinitionUI[] = [];

		if (props.dialogType === "add") {
			newFields = fields.filter((field) => field !== toDelete);
		} else if (props.dialogType === "edit") {
			if (toDelete.diff === "added") {
				newFields = fields.filter((field) => field !== toDelete);
			} else {
				newFields = fields.map((field) =>
					field !== toDelete ? field : { ...field, diff: "deleted" },
				);
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
				<SortableContext items={dndIds} strategy={verticalListSortingStrategy}>
					{fields.map((field, i) => (
						<FieldDefCard
							key={field.id}
							dndId={dndIds[i]!}
							field={field}
							dialogType={props.dialogType}
							onClick={() => props.onFieldClick(field)}
							onDelete={() => onDelete(field)}
							onRestore={() => onRestore(field)}
							onUnDelete={() => onUnDelete(field)}
						/>
					))}
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
	dialogType: DialogType;
	onClick: () => void;
	onDelete: () => void;
	onRestore: () => void;
	onUnDelete: () => void;
};
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
	const diffStyle: Record<Exclude<DiffType, "none">, string> = {
		added: "border-l-green-500",
		edited: "border-l-brand",
		deleted: "border-l-red-500",
	};

	return (
		<Card
			ref={setNodeRef}
			style={style}
			className={cn(
				props.dialogType === "edit" &&
					props.field.diff !== "none" &&
					`border-l-[3px] ${diffStyle[props.field.diff]}`,

				props.field.diff !== "deleted" && "cursor-pointer hover:bg-accent/70",

				"group flex-row gap-4 md:p-3",
			)}
			onClick={() => (props.field.diff !== "deleted" ? props.onClick() : undefined)}
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

			<div className="ml-auto flex items-center gap-2 text-sm transition-opacity">
				<Actions
					dialogType={props.dialogType}
					diff={props.field.diff}
					onDelete={props.onDelete}
					onRestore={props.onRestore}
					onUnDelete={props.onUnDelete}
				/>
			</div>
		</Card>
	);
}

interface ActionsProps {
	diff: FieldDefinitionUI["diff"];

	dialogType: DialogType;
	onRestore: () => void;
	onDelete: () => void;
	onUnDelete: () => void;
}
function Actions(props: ActionsProps) {
	function handleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, cb: () => void) {
		e.stopPropagation();
		cb();
	}

	const DefaultActions = () => (
		<ActionIcon
			variant={"simple"}
			className="text-destructive/75 hover:text-destructive"
			onClick={(e) => handleClick(e, props.onDelete)}
			tooltip="Delete"
		>
			<TrashIcon className="w-5" data-testid="delete-field-btn" />
		</ActionIcon>
	);

	if (props.dialogType === "edit") {
		switch (props.diff) {
			case "edited": {
				return (
					<ActionIcon
						variant={"simple"}
						className="mr-0.5"
						onClick={(e) => handleClick(e, props.onRestore)}
						tooltip="Restore"
					>
						<ArrowUturnLeftIcon className="w-5" data-testid="restore-field-btn" />
					</ActionIcon>
				);
			}
			case "deleted": {
				return (
					<ActionIcon
						variant={"simple"}
						className="mr-0.5"
						onClick={(e) => handleClick(e, props.onUnDelete)}
						tooltip="Restore"
					>
						<ArrowUturnLeftIcon className="w-5" data-testid="restore-field-btn" />
					</ActionIcon>
				);
			}

			case "added":
			case "none": {
				return <DefaultActions />;
			}
		}
	} else if (props.dialogType === "add") {
		return <DefaultActions />;
	}
}
