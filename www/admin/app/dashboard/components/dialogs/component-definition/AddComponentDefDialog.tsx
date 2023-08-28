import * as React from "react";
import type { ComponentDefinitionGroup } from "@prisma/client";
import { trpc } from "@admin/src/utils/trpc";
import {
	Button,
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	FormControl,
	FormError,
	FormField,
	FormItem,
	FormLabel,
	FormProvider,
	Input,
} from "@admin/src/components/ui/client";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CubeIcon } from "@heroicons/react/24/outline";
import { AddFieldDefs, FieldDefs } from "./FieldDefinitons";
import { fieldDefinitionUISchema } from "./shared";

const addComponentDefDialogInputsSchema = z.object({
	name: z.string().nonempty({ message: " " }),
	fields: z.array(fieldDefinitionUISchema.omit({ id: true, diff: true })),
});
type AddComponentDefDialogInputs = z.infer<typeof addComponentDefDialogInputsSchema>;

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
	group: ComponentDefinitionGroup;
}
export function AddComponentDefDialog(props: Props) {
	const mutation = trpc.components.addComponentDefinition.useMutation();
	const [anyEditing, setAnyEditing] = React.useState(false);

	const form = useForm<AddComponentDefDialogInputs>({
		resolver: zodResolver(addComponentDefDialogInputsSchema),
		defaultValues: { fields: [] },
	});
	const onSubmit: SubmitHandler<AddComponentDefDialogInputs> = (data) => {
		mutation.mutate(
			{
				name: data.name,
				fields: data.fields.map((f) => ({ name: f.name, type: f.type })),
				groupId: props.group.id,
			},
			{
				onSuccess: () => props.setOpen(false),
			},
		);
	};

	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Add component definition</DialogTitle>
				</DialogHeader>

				<FormProvider {...form}>
					<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input {...field} aria-required />
									</FormControl>
									<FormError />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="fields"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Fields</FormLabel>
									<FormControl>
										<AddFieldDefs dialogType="add" {...field} />
									</FormControl>
									<FormError />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="fields"
							render={({ field }) => (
								<FormItem className="max-h-[50vh] overflow-auto">
									<FormControl>
										<FieldDefs
											dialogType="add"
											anyEditing={anyEditing}
											setAnyEditing={setAnyEditing}
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="submit"
								disabled={anyEditing}
								loading={mutation.isLoading}
								icon={<CubeIcon className="w-5" />}
							>
								Add
							</Button>
						</DialogFooter>
					</form>
				</FormProvider>
			</DialogContent>
		</Dialog>
	);
}
