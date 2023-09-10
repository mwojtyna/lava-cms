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
import { AddFieldDefs, FieldDefs } from "./FieldDefinitions";
import { ComponentDefinitionNameError, fieldDefinitionUISchema } from "./shared";
import { TypographyMuted } from "@admin/src/components/ui/server";

const addComponentDefDialogInputsSchema = z.object({
	// This is named `compName` instead of `name` because `name` is already used
	// in the `FieldDefinitionUI` type and errors are duplicated.
	// Also it's easier to change this name than the other one
	compName: z.string().nonempty({ message: " " }),
	// Omitting id because it's not available when adding a new component definition
	fields: z.array(fieldDefinitionUISchema.omit({ id: true })),
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
				name: data.compName,
				fields: data.fields,
				groupId: props.group.id,
			},
			{
				onSuccess: () => props.setOpen(false),
				// Can't extract the whole handler to a shared function
				// because the type of `err` is impossible to specify
				onError: (err) => {
					if (err.data?.code === "CONFLICT") {
						const group = JSON.parse(err.message) as {
							name: string;
							id: string;
						};

						form.setError("compName", {
							type: "manual",
							message: (
								<ComponentDefinitionNameError name={data.compName} group={group} />
							) as unknown as string,
						});
					}
				},
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
							name="compName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Name&nbsp;<TypographyMuted>(unique)</TypographyMuted>
									</FormLabel>
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
										<AddFieldDefs anyEditing={anyEditing} {...field} />
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
