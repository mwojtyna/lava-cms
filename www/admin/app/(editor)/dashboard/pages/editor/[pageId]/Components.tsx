"use client";

import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { IconGripVertical } from "@tabler/icons-react";
import React from "react";
import { ActionIcon } from "@/src/components/ui/client";
import { Card, TypographyMuted } from "@/src/components/ui/server";
import { usePageEditor, type ComponentUI, type Diff } from "@/src/data/stores/pageEditor";
import { cn } from "@/src/utils/styling";

interface Props {
	components: ComponentUI[];
	onComponentClicked: (componentId: string) => void;
}
export function Components(props: Props) {
	// Don't get components from the store to avoid showing no components before hydration
	const { originalComponents, setComponents } = usePageEditor();

	function restoreComponent(component: ComponentUI): React.MouseEventHandler<HTMLButtonElement> {
		return (e) => {
			e.stopPropagation();
			const original = originalComponents.find((comp) => comp.id === component.id)!;
			const componentsCopy = [...props.components];
			componentsCopy.splice(componentsCopy.indexOf(component), 1, original);
			setComponents(componentsCopy);
		};
	}

	return (
		<div className="flex flex-col gap-2">
			{props.components.map((component) => {
				const diffStyle: Record<Diff, string> = {
					added: "border-l-green-500",
					edited: "border-l-brand",
					deleted: "border-l-red-500",
				};
				const lastDiff = component.diffs.at(-1);

				return (
					<Card
						key={component.id}
						className={cn(
							lastDiff && `border-l-[3px] ${diffStyle[lastDiff]}`,
							"cursor-pointer flex-row items-center gap-3 shadow-none transition-colors hover:bg-accent/70 md:p-4",
						)}
						onClick={() => props.onComponentClicked(component.id)}
					>
						<div className="flex items-center gap-2">
							<IconGripVertical
								className="w-5 cursor-move text-muted-foreground"
								onClick={(e) => e.stopPropagation()}
							/>
							<span className="font-medium">{component.name}</span>
						</div>

						<TypographyMuted>{component.definitionName}</TypographyMuted>

						{lastDiff === "edited" ? (
							<div className="ml-auto flex items-center justify-center">
								<ActionIcon
									variant={"simple"}
									onClick={restoreComponent(component)}
									tooltip="Restore"
								>
									<ArrowUturnLeftIcon
										className="w-5"
										data-testid="restore-field-btn"
									/>
								</ActionIcon>
							</div>
						) : null}
					</Card>
				);
			})}
		</div>
	);
}
