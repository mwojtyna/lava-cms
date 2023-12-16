"use client";

import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import React from "react";
import { Button } from "@/src/components/ui/client";
import { usePageEditor } from "@/src/data/stores/pageEditor";
import { trpc } from "@/src/utils/trpc";

export function SaveButton(props: { pageId: string }) {
	const { isDirty, currentComponents } = usePageEditor();
	const mutation = trpc.pages.editPageComponents.useMutation();

	return (
		<Button
			className="flex-row-reverse"
			icon={<ArrowDownTrayIcon className="w-5" />}
			disabled={!isDirty}
			loading={mutation.isLoading}
			onClick={() =>
				mutation.mutate({
					pageId: props.pageId,
					editedComponents: currentComponents.filter((comp) => comp.diff === "edited"),
				})
			}
		>
			Save
		</Button>
	);
}
