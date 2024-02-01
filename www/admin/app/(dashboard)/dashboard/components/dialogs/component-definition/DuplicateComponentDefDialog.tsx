import type { ComponentsTableComponentDef } from "../../ComponentsTable";
import type { inferRouterInputs } from "@trpc/server";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm, type SubmitHandler, FormProvider } from "react-hook-form";
import { Button, Sheet, SheetContent, SheetFooter } from "@/src/components/ui/client";
import { useComponentsTableDialogs } from "@/src/data/stores/componentDefinitions";
import { useAlertDialog, useWindowEvent } from "@/src/hooks";
import type { PrivateRouter } from "@/src/trpc/routes/private/_private";
import { cn } from "@/src/utils/styling";
import { trpc } from "@/src/utils/trpc";
import {
	ComponentDefEditor,
	componentDefEditorInputsSchema,
	type ComponentDefEditorInputs,
} from "./ComponentDefEditor";
import { FieldDefEditor } from "./FieldDefEditor";
import { ComponentDefinitionNameError, type Step } from "./shared";

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
	componentDef: ComponentsTableComponentDef;
}
export function DuplicateComponentDefDialog(props: Props) {
	const [steps, setSteps] = React.useState<Step[]>([
		{
			name: "component-definition",
			componentDef: props.componentDef,
		},
	]);

	const { fields, fieldsDirty } = useComponentsTableDialogs();
	const addMutation = trpc.components.addComponentDefinition.useMutation();

	const form = useForm<ComponentDefEditorInputs>({
		resolver: zodResolver(componentDefEditorInputsSchema),
		mode: "onChange",
	});
	const onSubmit: SubmitHandler<ComponentDefEditorInputs> = (data) => {
		type Field =
			inferRouterInputs<PrivateRouter>["components"]["addComponentDefinition"]["fields"][number];

		addMutation.mutate(
			{
				name: data.name,
				groupId: props.componentDef.parentGroupId!,
				fields: fields.map<Field>((f, i) => ({
					...f,
					order: i,
					array_item_type: f.arrayItemType,
				})),
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

						form.setError("name", {
							type: "manual",
							message: (
								<ComponentDefinitionNameError name={data.name} group={group} />
							) as unknown as string,
						});
					}
				},
			},
		);
	};

	const anyDirty = form.formState.isDirty || fieldsDirty;
	const canSubmit = props.open && form.formState.isValid && anyDirty;
	const alertDialog = useAlertDialog({
		title: "Discard changes?",
		description: "Are you sure you want to discard your changes?",
		yesMessage: "Discard",
		noMessage: "Cancel",
	});

	// Reset when dialog is opened
	React.useEffect(() => {
		if (props.open) {
			form.reset({ name: props.componentDef.name });
			setSteps([
				{
					name: "component-definition",
					componentDef: props.componentDef,
				},
			]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.open]);
	useWindowEvent("beforeunload", (e) => {
		if (props.open && canSubmit) {
			// Display a confirmation dialog
			e.preventDefault();
		}
	});

	function handleSetOpen(value: boolean) {
		if (!anyDirty) {
			props.setOpen(value);
		} else {
			alertDialog.open(() => props.setOpen(false));
		}
	}

	function displayStep(step: Step) {
		switch (step.name) {
			case "component-definition": {
				return (
					<ComponentDefEditor
						step={step}
						setSteps={setSteps}
						open={props.open}
						setOpen={handleSetOpen}
						onSubmit={() => props.setOpen(false)}
						dialogType="add"
						title={`Duplicate "${step.componentDef.name}"`}
					/>
				);
			}
			case "field-definition": {
				return <FieldDefEditor step={step} setSteps={setSteps} dialogType="add" />;
			}
		}
	}

	return (
		<>
			<Sheet open={props.open} onOpenChange={handleSetOpen}>
				<SheetContent className="w-screen sm:max-w-md">
					<FormProvider {...form}>
						<form
							className="flex flex-col gap-4"
							onSubmit={form.handleSubmit(onSubmit)}
						>
							{steps.map((step, i) => (
								<div
									key={i}
									className={cn(
										"flex flex-col gap-4",
										i < steps.length - 1 && "hidden",
									)}
								>
									{displayStep(step)}
								</div>
							))}

							<SheetFooter>
								<Button
									type="submit"
									loading={addMutation.isLoading}
									disabled={!canSubmit}
									icon={<DocumentDuplicateIcon className="w-5" />}
								>
									Duplicate
								</Button>
							</SheetFooter>
						</form>
					</FormProvider>
				</SheetContent>
			</Sheet>

			<alertDialog.Component />
		</>
	);
}
