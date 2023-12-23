"use client";

import { ArrowUturnLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { IconGripVertical } from "@tabler/icons-react";
import React from "react";
import { ActionIcon } from "@/src/components/ui/client";
import { Card, TypographyMuted } from "@/src/components/ui/server";
import { usePageEditor, type ComponentUI, type Diff } from "@/src/data/stores/pageEditor";
import { cn } from "@/src/utils/styling";

interface Props {
	components: ComponentUI[];
	onComponentClicked: (index: number) => void;
}
export function Components(props: Props) {
	// Don't get components from the store to avoid showing no components before hydration
	const { originalComponents, setComponents } = usePageEditor();

	function restoreComponent(component: ComponentUI) {
		const original = originalComponents.find((comp) => comp.id === component.id)!;
		const componentsCopy = [...props.components];
		componentsCopy.splice(componentsCopy.indexOf(component), 1, original);
		setComponents(componentsCopy);
	}
	function deleteComponent(component: ComponentUI) {
		const componentsCopy = [...props.components];
		componentsCopy.splice(componentsCopy.indexOf(component), 1, {
			...component,
			diff: "deleted",
		});
		setComponents(componentsCopy);
	}
	function unDeleteComponent(component: ComponentUI) {
		const componentsCopy = [...props.components];
		componentsCopy.splice(componentsCopy.indexOf(component), 1, {
			...component,
			diff: "none",
		});
		setComponents(componentsCopy);
	}

	return (
		<div className="flex flex-col gap-2">
			{props.components.map((component) => {
				const diffStyle: Record<Exclude<Diff, "none">, string> = {
					added: "border-l-green-500",
					edited: "border-l-brand",
					deleted: "border-l-red-500",
				};

				return (
					<Card
						key={component.id}
						className={cn(
							component.diff !== "none" &&
								`border-l-[3px] ${diffStyle[component.diff]}`,
							"flex-row items-center gap-3 shadow-none transition-colors md:p-4",
							component.diff !== "deleted" && "cursor-pointer hover:bg-accent/70",
						)}
						onClick={() =>
							component.diff === "deleted"
								? undefined
								: props.onComponentClicked(component.order)
						}
						aria-disabled={component.diff === "deleted"}
					>
						<div className="flex items-center gap-2">
							<IconGripVertical
								className={cn(
									"w-5 cursor-move text-muted-foreground",
									component.diff === "deleted" &&
										"cursor-auto text-muted-foreground/50",
								)}
								onClick={(e) => e.stopPropagation()}
							/>
							<span className="font-medium">{component.name}</span>
						</div>

						<TypographyMuted>{component.definition.name}</TypographyMuted>

						<Actions
							diff={component.diff}
							restoreComponent={() => restoreComponent(component)}
							deleteComponent={() => deleteComponent(component)}
							unDeleteComponent={() => unDeleteComponent(component)}
						/>
					</Card>
				);
			})}
		</div>
	);
}

interface ActionsProps {
	diff: Diff;
	restoreComponent: () => void;
	deleteComponent: () => void;
	unDeleteComponent: () => void;
}
function Actions(props: ActionsProps) {
	function handleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, cb: () => void) {
		e.stopPropagation();
		cb();
	}

	switch (props.diff) {
		case "edited": {
			return (
				<div className="ml-auto flex items-center justify-center">
					<ActionIcon
						variant={"simple"}
						onClick={(e) => handleClick(e, props.restoreComponent)}
						tooltip="Restore"
					>
						<ArrowUturnLeftIcon className="w-5" data-testid="restore-component-btn" />
					</ActionIcon>
				</div>
			);
		}
		case "deleted": {
			return (
				<div className="ml-auto flex items-center justify-center">
					<ActionIcon
						variant={"simple"}
						onClick={(e) => handleClick(e, props.unDeleteComponent)}
						tooltip="Restore"
					>
						<ArrowUturnLeftIcon className="w-5" data-testid="restore-component-btn" />
					</ActionIcon>
				</div>
			);
		}
		case "none": {
			return (
				<div className="ml-auto flex items-center justify-center">
					<ActionIcon
						variant={"simple"}
						onClick={(e) => handleClick(e, props.deleteComponent)}
						tooltip="Delete"
					>
						<TrashIcon
							className="w-5 text-destructive/75 hover:text-destructive"
							data-testid="delete-component-btn"
						/>
					</ActionIcon>
				</div>
			);
		}
	}
}
