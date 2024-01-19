import type { Step } from "./shared";
import type { ComponentsTableComponentDef } from "../../ComponentsTable";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import * as React from "react";
import { Sheet, SheetContent } from "@/src/components/ui/client";
import { useComponentsTableDialogs } from "@/src/data/stores/componentDefinitions";
import { cn } from "@/src/utils/styling";
import { ComponentDefEditor } from "./ComponentDefEditor";
import { FieldDefEditor } from "./FieldDefEditor";

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
	React.useEffect(() => {
		if (props.open) {
			setSteps([
				{
					name: "component-definition",
					componentDef: props.componentDef,
				},
			]);
		}
	}, [props.componentDef, props.open]);

	const { fieldsDirty } = useComponentsTableDialogs();
	const [isDirtyCompDef, setIsDirtyCompDef] = React.useState(false);
	const anyDirty = isDirtyCompDef || fieldsDirty;

	function handleSetOpen(value: boolean) {
		if (!anyDirty) {
			props.setOpen(value);
		} else if (confirm("Are you sure you want to discard your changes?")) {
			props.setOpen(value);
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
						isDirty={anyDirty}
						setIsDirty={setIsDirtyCompDef}
						dialogType="edit"
						title={`Edit "${step.componentDef.name}"`}
						submitButton={{
							text: "Edit",
							icon: <PencilSquareIcon className="w-5" />,
						}}
					/>
				);
			}
			case "field-definition": {
				return <FieldDefEditor step={step} setSteps={setSteps} dialogType="edit" />;
			}
		}
	}

	return (
		<Sheet open={props.open} onOpenChange={handleSetOpen}>
			<SheetContent className="w-screen sm:max-w-md">
				{steps.map((step, i) => (
					<div
						key={i}
						className={cn("flex flex-col gap-4", i < steps.length - 1 && "hidden")}
					>
						{displayStep(step)}
					</div>
				))}
			</SheetContent>
		</Sheet>
	);
}
