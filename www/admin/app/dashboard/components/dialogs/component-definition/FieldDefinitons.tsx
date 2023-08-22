import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { IconGripVertical } from "@tabler/icons-react";
import {
	ArrowRightIcon,
	PencilSquareIcon,
	TrashIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
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
export const FieldDefs = React.forwardRef<React.ComponentRef<"div">, FieldDefsProps>(
	(props, ref) => {
		const [anyEditing, setAnyEditing] = React.useState(false);

		return props.value.length > 0 ? (
			<div ref={ref} className="flex flex-col gap-2">
				{props.value.map((field, i) => (
					<FieldDef
						key={i}
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
			</div>
		) : (
			<TypographyMuted>No fields added</TypographyMuted>
		);
	},
);
FieldDefs.displayName = "FieldDefs";

interface FieldDefProps {
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
		defaultValues: props.field,
	});
	const onSubmit: SubmitHandler<FieldDefinition> = (data) => {
		props.onEditSubmit(props.field, data);
		setIsEditing(false);
	};

	function cancel() {
		setIsEditing(false);
		props.onEditCancel();
		form.reset();
	}

	return (
		<Card className="group flex-row gap-4 md:p-3">
			<div className="flex items-center gap-3">
				<IconGripVertical className="w-5 cursor-move text-muted-foreground" />
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
