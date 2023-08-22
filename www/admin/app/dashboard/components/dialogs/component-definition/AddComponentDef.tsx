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
import { AddFieldDefs, FieldDefs, fieldDefinitionSchema } from "./FieldDefinitons";

const addComponentDefDialogInputsSchema = z.object({
	name: z.string().nonempty({ message: " " }),
	fields: z.array(fieldDefinitionSchema),
});
type AddComponentDefDialogInputs = z.infer<typeof addComponentDefDialogInputsSchema>;

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
	group: ComponentDefinitionGroup;
}
export function AddComponentDefDialog(props: Props) {
	const mutation = trpc.components.addComponentDefinition.useMutation();

	const form = useForm<AddComponentDefDialogInputs>({
		resolver: zodResolver(addComponentDefDialogInputsSchema),
		defaultValues: { fields: [] },
	});
	const onSubmit: SubmitHandler<AddComponentDefDialogInputs> = (data) => {
		mutation.mutate(
			{
				name: data.name,
				fields: data.fields,
				groupId: props.group.id,
			},
			{
				onSuccess: () => props.setOpen(false),
			},
		);
	};

	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent className="max-h-[95vh] max-w-md overflow-auto">
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
										<AddFieldDefs {...field} />
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
									<FormControl>
										<FieldDefs dialogType="add" {...field} />
									</FormControl>
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="submit"
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