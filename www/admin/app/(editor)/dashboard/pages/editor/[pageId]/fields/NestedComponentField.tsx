import { ArrowPathRoundedSquareIcon } from "@heroicons/react/24/outline";
import { useState, useMemo } from "react";
import { ActionIcon, Button } from "@/src/components/ui/client";
import { type ComponentUI, usePageEditorStore } from "@/src/data/stores/pageEditor";
import { ComponentCard } from "../Components";
import { AddComponentDialog, createComponentInstance } from "../dialogs/AddComponentDialog";

interface NestedComponentFieldProps {
	value: string;
	onChange: (id: string) => void;

	className?: string;
	parentComponent: ComponentUI;
	edited: boolean;

	onRestore?: () => void;
	onUnAdd?: () => void;
	onRemove?: () => void;
	onUnRemove?: () => void;
}
export function NestedComponentField(props: NestedComponentFieldProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const { setSteps, originalNestedComponents, nestedComponents, setNestedComponents } =
		usePageEditorStore((state) => ({
			setSteps: state.setSteps,
			originalNestedComponents: state.originalNestedComponents,
			nestedComponents: state.nestedComponents,
			setNestedComponents: state.setNestedComponents,
		}));

	const currentComponent = useMemo(
		() => nestedComponents.find((comp) => comp.id === props.value),
		[nestedComponents, props.value],
	);
	const originalComponent = useMemo(
		() => originalNestedComponents.find((comp) => comp.id === props.value),
		[originalNestedComponents, props.value],
	);

	async function selectComponent(id: string) {
		const newComponent = await createComponentInstance(
			id,
			{
				order: 0,
				parentComponentId: props.parentComponent.id,
				pageId: props.parentComponent.pageId,
			},
			currentComponent,
		);

		props.onChange(newComponent.id);
		setNestedComponents((nestedComponents) =>
			currentComponent
				? nestedComponents.map((nc) => (nc.id === currentComponent.id ? newComponent : nc))
				: [...nestedComponents, newComponent],
		);
	}

	function restore() {
		props.onChange(originalComponent!.id);
		setNestedComponents((nestedComponents) =>
			nestedComponents.map((c) => (c.id === originalComponent!.id ? originalComponent! : c)),
		);
		props.onRestore?.();
	}
	function remove(component: ComponentUI) {
		setNestedComponents((nestedComponents) =>
			nestedComponents.map((c) => (c.id === component.id ? { ...c, diff: "deleted" } : c)),
		);
		props.onRemove?.();
	}
	function unRemove(component: ComponentUI) {
		setNestedComponents((nestedComponents) =>
			nestedComponents.map((c) => (c.id === component.id ? { ...c, diff: "none" } : c)),
		);
		props.onUnRemove?.();
	}
	function unAdd(component: ComponentUI) {
		props.onChange("");
		setNestedComponents((nestedComponents) =>
			nestedComponents.filter((c) => c.id !== component.id),
		);
		props.onUnAdd?.();
	}

	return (
		<>
			{currentComponent && (
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
						extraActions={
							currentComponent.diff !== "added" &&
							currentComponent.diff !== "deleted" && (
								<ActionIcon
									className="mx-1"
									variant={"simple"}
									tooltip="Change"
									onClick={(e) => {
										e.stopPropagation();
										setDialogOpen(true);
									}}
								>
									<ArrowPathRoundedSquareIcon className="w-5" />
								</ActionIcon>
							)
						}
						onRestore={restore}
						onRemove={() => remove(currentComponent)}
						onUnRemove={() => unRemove(currentComponent)}
						onUnAdd={() => unAdd(currentComponent)}
					/>
				</div>
			)}
			{!currentComponent && (
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
