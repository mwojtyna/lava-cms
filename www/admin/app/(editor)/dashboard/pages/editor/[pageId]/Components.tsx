"use client";

import type { Component } from "./types";
import { IconGripVertical } from "@tabler/icons-react";
import React from "react";
import { Card, TypographyMuted } from "@/src/components/ui/server";

interface Props {
	components: Component[];
	onComponentClicked: (componentId: string) => void;
}
export function Components(props: Props) {
	return (
		<div className="flex flex-col gap-2">
			{props.components.map((component) => (
				<Card
					key={component.id}
					className="cursor-pointer flex-row items-center gap-3 shadow-none transition-colors hover:border-l-brand hover:bg-accent/70 md:p-4"
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
			))}
		</div>
	);
}
