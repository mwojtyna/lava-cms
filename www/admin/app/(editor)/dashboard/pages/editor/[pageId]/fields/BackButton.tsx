"use client";

import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import React from "react";
import { ActionIcon } from "@/src/components/ui/client/ActionIcon";
import { usePageEditorStore } from "@/src/data/stores/pageEditor";
import { useAlertDialog } from "@/src/hooks/useAlertDialog";

export function BackButton() {
	const router = useRouter();
	const alertDialog = useAlertDialog();

	return (
		<ActionIcon
			variant={"outline"}
			onMouseDown={(e) => {
				// If pressed middle button, open in new tab
				if (e.button === 1) {
					window.open("/admin/dashboard/pages", "_blank");
					return;
				}
			}}
			onClick={() => {
				if (usePageEditorStore.getState().isDirty) {
					alertDialog.open(
						{
							title: "Discard changes?",
							description: "Are you sure you want to discard your changes?",
							yesMessage: "Discard",
							noMessage: "Cancel",
						},
						() => router.push("/dashboard/pages"),
					);
					return;
				}
				router.push("/dashboard/pages");
			}}
			aria-label="Go back to dashboard"
		>
			<ArrowUturnLeftIcon className="w-5" />
			Return
		</ActionIcon>
	);
}
