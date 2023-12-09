"use client";

import React from "react";
import { IconGripVertical } from "@tabler/icons-react";
import { Card, TypographyMuted } from "@admin/src/components/ui/server";
import { trpc } from "@admin/src/utils/trpc";
import type { inferRouterOutputs } from "@trpc/server";
import type { PrivateRouter } from "@admin/src/trpc/routes/private/_private";

interface Props {
	pageId: string;
	serverData: inferRouterOutputs<PrivateRouter>["pages"]["getPageComponents"];
}
export function Components(props: Props) {
	const { data: components } = trpc.pages.getPageComponents.useQuery(
		{ id: props.pageId },
		{ initialData: props.serverData },
	);

	return (
		<div className="flex flex-col gap-2">
			{components.map((component, i) => (
				<Card key={i} className="md:p-4">
					<div className="flex items-center gap-3">
						<div className="flex gap-2">
							<IconGripVertical className="w-5 cursor-move text-muted-foreground" />
							<span className="font-medium">{component.name}</span>
						</div>

						<TypographyMuted>{component.definition.name}</TypographyMuted>
					</div>
				</Card>
			))}
		</div>
	);
}
