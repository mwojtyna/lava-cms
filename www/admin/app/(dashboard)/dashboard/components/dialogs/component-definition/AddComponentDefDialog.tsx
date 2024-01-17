import type { ComponentsTableComponentDef } from "../../ComponentsTable";
import type { ComponentDefinitionGroup } from "@prisma/client";
import { CubeIcon } from "@heroicons/react/24/outline";
import * as React from "react";
import { Sheet, SheetContent } from "@/src/components/ui/client";
import { ComponentDefStep, FieldDefStep, type Step } from "./ComponentDefSteps";

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
	group: ComponentDefinitionGroup;
}
export function AddComponentDefDialog(props: Props) {
	const EMPTY_COMPONENT_DEF: ComponentsTableComponentDef = React.useMemo(
		() => ({
			id: "",
			name: "",
			instances: [],
			lastUpdate: new Date(),
			parentGroupId: props.group.id,
			fieldDefinitions: [],
		}),
		[props.group.id],
	);

	const [steps, setSteps] = React.useState<Step[]>([
		{
			name: "component-definition",
			componentDef: EMPTY_COMPONENT_DEF,
		},
	]);
	React.useEffect(() => {
		setSteps([
			{
				name: "component-definition",
				componentDef: EMPTY_COMPONENT_DEF,
			},
		]);
	}, [EMPTY_COMPONENT_DEF, props.group.id]);

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
						title="Add component definition"
						submitButton={{
							text: "Add",
							icon: <CubeIcon className="w-5" />,
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
