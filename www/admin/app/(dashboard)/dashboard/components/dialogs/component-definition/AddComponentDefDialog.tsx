import type { ComponentsTableComponentDef } from "../../ComponentsTable";
import type { ComponentDefinitionGroup } from "@prisma/client";
import * as React from "react";
import { Sheet } from "@/src/components/ui/client";
import { ComponentDefStep, type Step } from "./ComponentDefSteps";
import { CubeIcon } from "@heroicons/react/24/outline";

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

	switch (lastStep.name) {
		case "component-definition": {
			function handleSetOpen(value: boolean) {
				if (!isDirty) {
					props.setOpen(value);
				} else if (confirm("Are you sure you want to discard your changes?")) {
					props.setOpen(value);
				}
			}

			return (
				<Sheet open={props.open} onOpenChange={handleSetOpen}>
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
				</Sheet>
			);
		}
		case "field-definition": {
			return (
				<Sheet open={props.open} onOpenChange={props.setOpen}>
					chuj
				</Sheet>
			);
		}
	}
}
