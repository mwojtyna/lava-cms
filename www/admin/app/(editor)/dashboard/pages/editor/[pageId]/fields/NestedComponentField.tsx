import { useState, useMemo } from "react";
import { Button } from "@/src/components/ui/client/Button";
import { type ComponentUI, usePageEditorStore } from "@/src/stores/pageEditor";
import { AddComponentDialog, createComponentInstance } from "../dialogs/AddComponentDialog";
import { ComponentCard } from "../RootComponents";

interface NestedComponentFieldProps {
	onChange?: (id: string) => void;

	className?: string;
	parentFieldId: string | null;
	parentArrayItemId: string | null;
	pageId: string;

	onRemove?: () => void;
}
export function NestedComponentField(props: NestedComponentFieldProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const { setSteps, nestedComponents, setNestedComponents } = usePageEditorStore((state) => ({
		setSteps: state.setSteps,
		nestedComponents: state.nestedComponents,
		setNestedComponents: state.setNestedComponents,
	}));

	const currentComponent = useMemo(
		() =>
			nestedComponents.find((comp) => {
				if (props.parentFieldId !== null) {
					return comp.parentFieldId === props.parentFieldId;
				} else if (props.parentArrayItemId !== null) {
					return comp.parentArrayItemId === props.parentArrayItemId;
				}
			}),
		[nestedComponents, props.parentArrayItemId, props.parentFieldId],
	);

	// If the component is in an array item, this method only runs when replacing the component
	async function selectComponent(id: string) {
		const newComponent = await createComponentInstance(
			id,
			{
				order: 0,
				parentFieldId: currentComponent?.parentFieldId ?? props.parentFieldId,
				parentArrayItemId: currentComponent?.parentArrayItemId ?? props.parentArrayItemId,
				pageId: props.pageId,
			},
			currentComponent,
		);

		props.onChange?.(newComponent.id);
		setNestedComponents((nestedComponents) =>
			currentComponent
				? nestedComponents.map((nc) => (nc.id === currentComponent.id ? newComponent : nc))
				: [...nestedComponents, newComponent],
		);
	}

	function remove(component: ComponentUI) {
		setNestedComponents((nestedComponents) =>
			nestedComponents.map((c) => (c.id === component.id ? { ...c, diff: "deleted" } : c)),
		);
		props.onRemove?.();
	}

	return (
		<>
			{currentComponent && currentComponent.diff !== "deleted" && (
				<div className={props.className}>
					<ComponentCard
						dndId="0"
						noDrag
						component={{
							id: currentComponent.id,
							name: currentComponent.definition.name,
							diff: currentComponent.diff,
						}}
						onClick={() =>
							setSteps((steps) => [
								...steps,
								{
									name: "edit-nested-component",
									nestedComponentId: currentComponent.id,
								},
							])
						}
						onRemove={() => remove(currentComponent)}
					/>
				</div>
			)}
			{(!currentComponent || currentComponent?.diff === "deleted") && (
				<Button variant={"outline"} onClick={() => setDialogOpen(true)}>
					Select component
				</Button>
			)}

			<AddComponentDialog
				open={dialogOpen}
				setOpen={setDialogOpen}
				onSubmit={selectComponent}
			/>
		</>
	);
}
