import type { ComponentsTableComponentDef } from "../../ComponentsTable";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import * as React from "react";
import { Sheet, SheetContent } from "@/src/components/ui/client";
import { type Step, ComponentDefStep, FieldDefStep } from "./ComponentDefSteps";

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
	React.useEffect(() => {
		setSteps([
			{
				name: "component-definition",
				componentDef: props.componentDef,
			},
		]);
	}, [props.componentDef]);

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
					<ComponentDefStep
						step={lastStep}
						setSteps={setSteps}
						open={props.open}
						setOpen={handleSetOpen}
						onSubmit={() => props.setOpen(false)}
						isDirty={isDirty}
						setIsDirty={setIsDirty}
						dialogType="add"
						title={`Duplicate "${lastStep.componentDef.name}"`}
						submitButton={{
							text: "Duplicate",
							icon: <DocumentDuplicateIcon className="w-5" />,
						}}
					/>
				);
			}
			case "field-definition": {
				return <FieldDefStep step={lastStep} setSteps={setSteps} />;
			}
		}
	}

	return (
		<Sheet open={props.open} onOpenChange={handleSetOpen}>
			<SheetContent className="w-screen sm:max-w-md">{displayStep()}</SheetContent>
		</Sheet>
	);
}
