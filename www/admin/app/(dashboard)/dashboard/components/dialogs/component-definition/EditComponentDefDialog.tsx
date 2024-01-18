import type { Step } from "./shared";
import type { ComponentsTableComponentDef } from "../../ComponentsTable";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import * as React from "react";
import { Sheet, SheetContent } from "@/src/components/ui/client";
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

	const [isDirty, setIsDirty] = React.useState(false);
	const lastStep = steps.at(-1)!;

	function handleSetOpen(value: boolean) {
		if (!isDirty) {
			props.setOpen(value);
		} else if (confirm("Are you sure you want to discard your changes?")) {
			props.setOpen(value);
		}
	}

	function displayStep() {
		switch (lastStep.name) {
			case "component-definition": {
				return (
					<ComponentDefEditor
						step={lastStep}
						setSteps={setSteps}
						open={props.open}
						setOpen={handleSetOpen}
						onSubmit={() => props.setOpen(false)}
						isDirty={isDirty}
						setIsDirty={setIsDirty}
						dialogType="edit"
						title={`Edit "${lastStep.componentDef.name}"`}
						submitButton={{
							text: "Edit",
							icon: <PencilSquareIcon className="w-5" />,
						}}
					/>
				);
			}
			case "field-definition": {
				return (
					<FieldDefEditor
						step={lastStep}
						setSteps={setSteps}
						isDirty={isDirty}
						setIsDirty={setIsDirty}
						dialogType="edit"
					/>
				);
			}
		}
	}

	return (
		<Sheet open={props.open} onOpenChange={handleSetOpen}>
			<SheetContent className="w-screen sm:max-w-md">{displayStep()}</SheetContent>
		</Sheet>
	);
}
