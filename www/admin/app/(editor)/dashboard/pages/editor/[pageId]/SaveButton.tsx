"use client";

import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import React from "react";
import { Button } from "@/src/components/ui/client";
import { usePageEditorStore } from "@/src/data/stores/pageEditor";
import { trpc } from "@/src/utils/trpc";

export function SaveButton(props: { pageId: string }) {
	const { isDirty, save, isSaving, isTyping } = usePageEditorStore((state) => ({
		isDirty: state.isDirty,
		save: state.save,
		isSaving: state.isSaving,
		isTyping: state.isTyping,
	}));
	const mutation = trpc.pages.editPageComponents.useMutation();

	return (
		<Button
			className="flex-row-reverse max-md:hidden max-sm:p-3"
			icon={<ArrowDownTrayIcon className="w-5" />}
			disabled={!isDirty || (isDirty && isTyping)}
			loading={isSaving}
			onClick={() => save(mutation, props.pageId)}
			aria-keyshortcuts="Control+S"
		>
			Save
		</Button>
	);
}
