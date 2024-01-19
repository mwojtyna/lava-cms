import type { Step } from "./shared";
import type { ComponentsTableComponentDef } from "../../ComponentsTable";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import * as React from "react";
import { Sheet, SheetContent } from "@/src/components/ui/client";
import { ComponentDefEditor } from "./ComponentDefEditor";
import { FieldDefEditor } from "./FieldDefEditor";
import { cn } from "@/src/utils/styling";

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

	const [isDirtyCompDef, setIsDirtyCompDef] = React.useState(false);
	const [isDirtyFieldDefs, setIsDirtyFieldDefs] = React.useState(false);
	const anyDirty = isDirtyCompDef || isDirtyFieldDefs;

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
						dialogType="add"
						title={`Duplicate "${step.componentDef.name}"`}
						submitButton={{
							text: "Duplicate",
							icon: <DocumentDuplicateIcon className="w-5" />,
						}}
					/>
				);
			}
			case "field-definition": {
				return (
					<FieldDefEditor
						step={step}
						setSteps={setSteps}
						isDirty={anyDirty}
						setIsDirty={setIsDirtyFieldDefs}
						dialogType="add"
					/>
				);
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
