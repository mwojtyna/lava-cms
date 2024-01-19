import type { Step } from "./shared";
import type { ComponentsTableComponentDef } from "../../ComponentsTable";
import type { ComponentDefinitionGroup } from "@prisma/client";
import { CubeIcon } from "@heroicons/react/24/outline";
import * as React from "react";
import { Sheet, SheetContent } from "@/src/components/ui/client";
import { useComponentsTableDialogs } from "@/src/data/stores/componentDefinitions";
import { cn } from "@/src/utils/styling";
import { ComponentDefEditor } from "./ComponentDefEditor";
import { FieldDefEditor } from "./FieldDefEditor";

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
				return <FieldDefEditor step={step} setSteps={setSteps} dialogType="add" />;
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
