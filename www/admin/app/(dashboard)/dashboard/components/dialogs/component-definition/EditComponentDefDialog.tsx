import type { ComponentsTableComponentDef } from "../../ComponentsTable";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
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
import { type FieldDefinitionUI, ComponentDefinitionNameError } from "./shared";

const editComponentDefDialogInputsSchema = z.object({
	compName: z.string().min(1, { message: " " }),
});
type EditComponentDefDialogInputs = z.infer<typeof editComponentDefDialogInputsSchema>;

type Step =
	| {
			name: "component-definition";
			componentDef: ComponentsTableComponentDef;
	  }
	| {
			name: "field-definition";
			fieldDef: FieldDefinitionUI;
	  };

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
	componentDef: ComponentsTableComponentDef;
}
export function EditComponentDefDialog(props: Props) {
	const [steps, setSteps] = React.useState<Step[]>([
		{
			name: "component-definition",
			componentDef: props.componentDef,
		},
	]);
	const lastStep = steps.at(-1)!;

	switch (lastStep.name) {
		case "component-definition": {
			return (
				<Dialog open={props.open} onOpenChange={props.setOpen}>
					<ComponentDefStep
						step={lastStep}
						setSteps={setSteps}
						open={props.open}
						setOpen={props.setOpen}
					/>
				</Dialog>
			);
		}
		case "field-definition": {
			return (
				<Dialog open={props.open} onOpenChange={props.setOpen}>
					chuj
				</Dialog>
			);
		}
	}
}

interface ComponentDefStepProps {
	step: Extract<Step, { name: "component-definition" }>;
	setSteps: React.Dispatch<React.SetStateAction<Step[]>>;
	open: boolean;
	setOpen: (value: boolean) => void;
}
function ComponentDefStep(props: ComponentDefStepProps) {
	const mutation = trpc.components.editComponentDefinition.useMutation();
	const { originalFields, fields } = useComponentsTableDialogs();

	const form = useForm<EditComponentDefDialogInputs>({
		resolver: zodResolver(editComponentDefDialogInputsSchema),
	});
	const onSubmit: SubmitHandler<EditComponentDefDialogInputs> = (data) => {
		const addedFields = fields
			.map((f, i) => ({ ...f, order: i }))
			.filter((f) => f.diff === "added");

		const deletedFieldIds = fields.filter((f) => f.diff === "deleted").map((f) => f.id);

		const editedFields = fields
			.map((ef, i) => ({
				...ef,
				id: ef.id,
				order: i,
			}))
			.filter((f) =>
				originalFields.find(
					(of) => f.id === of.id && (f.diff === "edited" || f.diff === "reordered"),
				),
			);

		mutation.mutate(
			{
				id: props.step.componentDef.id,
				newName: data.compName,
				newGroupId: props.step.componentDef.parentGroupId!,
				addedFields,
				deletedFieldIds,
				editedFields,
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
			form.reset({ compName: props.step.componentDef.name });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.open]);

	return (
		<DialogContent className="max-w-md">
			<DialogHeader>
				<DialogTitle>Edit &quot;{props.step.componentDef.name}&quot;</DialogTitle>
			</DialogHeader>

			<FormProvider {...form}>
				<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
					<FormField
						control={form.control}
						name="compName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Name&nbsp;
									<TypographyMuted>(unique)</TypographyMuted>
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

					<FieldDefs dialogType="edit" />

					<DialogFooter>
						<Button
							type="submit"
							loading={mutation.isLoading}
							icon={<PencilSquareIcon className="w-5" />}
						>
							Edit
						</Button>
					</DialogFooter>
				</form>
			</FormProvider>
		</DialogContent>
	);
}
