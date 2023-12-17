"use client";

import { IconGripVertical } from "@tabler/icons-react";
import React from "react";
import { Card, TypographyMuted } from "@/src/components/ui/server";
import type { ComponentUI, Diff } from "@/src/data/stores/pageEditor";
import { cn } from "@/src/utils/styling";

interface Props {
	components: ComponentUI[];
	onComponentClicked: (componentId: string) => void;
}
export function Components(props: Props) {
	return (
		<div className="flex flex-col gap-2">
			{props.components.map((component) => {
				const diffStyle: Record<Diff, string> = {
					added: "border-l-green-500",
					edited: "border-l-yellow-500",
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
					</Card>
				);
			})}
		</div>
	);
}
