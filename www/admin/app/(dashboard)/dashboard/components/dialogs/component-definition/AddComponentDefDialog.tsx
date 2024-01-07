import type { ComponentDefinitionGroup } from "@prisma/client";
import { CubeIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
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
} from "@/src/components/ui/client";
import { TypographyMuted } from "@/src/components/ui/server";
import { useComponentsTableDialogs } from "@/src/data/stores/componentDefinitions";
import { trpc } from "@/src/utils/trpc";
import { AddFieldDefs, FieldDefs } from "./FieldDefinitions";
import { ComponentDefinitionNameError } from "./shared";

const addComponentDefDialogInputsSchema = z.object({
	// This is named `compName` instead of `name` because `name` is already used
	// in the `FieldDefinitionUI` type and errors are duplicated.
	// Also it's easier to change this name than the other one
	compName: z.string().trim().min(1, { message: "Name cannot be empty" }),
});
type AddComponentDefDialogInputs = z.infer<typeof addComponentDefDialogInputsSchema>;

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
	group: ComponentDefinitionGroup;
}
export function AddComponentDefDialog(props: Props) {
	const mutation = trpc.components.addComponentDefinition.useMutation();
	const { fields } = useComponentsTableDialogs();

	const form = useForm<AddComponentDefDialogInputs>({
		resolver: zodResolver(addComponentDefDialogInputsSchema),
	});
	const onSubmit: SubmitHandler<AddComponentDefDialogInputs> = (data) => {
		mutation.mutate(
			{
				name: data.compName,
				fields,
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

	React.useEffect(() => {
		if (props.open) {
			form.reset();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.open]);

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
						<FormItem>
							<FormLabel>Fields</FormLabel>
							<AddFieldDefs />
						</FormItem>

						<FieldDefs dialogType="add" />

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
