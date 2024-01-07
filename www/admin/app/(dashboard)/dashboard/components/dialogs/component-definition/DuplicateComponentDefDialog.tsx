import type { ComponentsTableComponentDef } from "../../ComponentsTable";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm, type SubmitHandler, FormProvider } from "react-hook-form";
import { z } from "zod";
import { NewParentSelect } from "@/src/components";
import {
	DialogHeader,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	Input,
	FormError,
	DialogFooter,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
} from "@/src/components/ui/client";
import { TypographyMuted } from "@/src/components/ui/server";
import { useComponentsTableDialogs } from "@/src/data/stores/componentDefinitions";
import { trpc } from "@/src/utils/trpc";
import { AddFieldDefs, FieldDefs } from "./FieldDefinitions";
import { ComponentDefinitionNameError, groupsToComboboxEntries } from "./shared";

const duplicateComponentDefDialogInputsSchema = z.object({
	// This is named `compName` instead of `name` because `name` is already used
	// in the `FieldDefinitionUI` type and errors are duplicated.
	// Also it's easier to change this name than the other one
	compName: z.string().min(1, { message: " " }),
	newParentId: z.string().cuid(),
});
type DuplicateComponentDefDialogInputs = z.infer<typeof duplicateComponentDefDialogInputsSchema>;

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
	componentDef: ComponentsTableComponentDef;
}
export function DuplicateComponentDefDialog(props: Props) {
	const mutation = trpc.components.addComponentDefinition.useMutation();
	const { fields } = useComponentsTableDialogs();

	const allGroups = trpc.components.getAllGroups.useQuery(undefined, {
		enabled: props.open,
	}).data;
	const groups = React.useMemo(() => groupsToComboboxEntries(allGroups ?? []), [allGroups]);

	const form = useForm<DuplicateComponentDefDialogInputs>({
		resolver: zodResolver(duplicateComponentDefDialogInputsSchema),
	});
	const onSubmit: SubmitHandler<DuplicateComponentDefDialogInputs> = (data) => {
		mutation.mutate(
			{
				name: data.compName,
				fields: fields,
				groupId: data.newParentId,
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
		form.reset({
			compName: props.componentDef.name,
			// null -> undefined
			newParentId: props.componentDef.parentGroupId ?? undefined,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.open]);

	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>
						Duplicate component definition &quot;{props.componentDef.name}&quot;
					</DialogTitle>
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

						<FormField
							control={form.control}
							name="newParentId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Group</FormLabel>
									<FormControl>
										<NewParentSelect parents={groups ?? []} {...field} />
									</FormControl>
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="submit"
								loading={mutation.isLoading}
								icon={<DocumentDuplicateIcon className="w-5" />}
							>
								Duplicate
							</Button>
						</DialogFooter>
					</form>
				</FormProvider>
			</DialogContent>
		</Dialog>
	);
}
