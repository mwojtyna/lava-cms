"use client";

import React from "react";
import { IconGripVertical } from "@tabler/icons-react";
import { Card, TypographyMuted } from "@admin/src/components/ui/server";
import { trpc } from "@admin/src/utils/trpc";
import type { Component } from "./types";

interface Props {
	pageId: string;
	components: Component[];
	onComponentClicked: (componentId: string) => void;
}
export function Components(props: Props) {
	const { data: components } = trpc.pages.getPageComponents.useQuery(
		{ id: props.pageId },
		{ initialData: props.components },
	);

	return (
		<div className="flex flex-col gap-2">
			{components.map((component, i) => (
				<Card
					key={i}
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

					<TypographyMuted>{component.definition.name}</TypographyMuted>
				</Card>
			))}
		</div>
	);
}
