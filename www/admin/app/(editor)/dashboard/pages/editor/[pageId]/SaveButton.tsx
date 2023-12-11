"use client";

import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import React from "react";
import { Button } from "@/src/components/ui/client";
import { usePageEditor } from "@/src/data/stores/pageEditor";

export function SaveButton() {
	const { isDirty } = usePageEditor();

	return (
		<Button
			className="flex-row-reverse"
			icon={<ArrowDownTrayIcon className="w-5" />}
			disabled={!isDirty}
		>
			Save
		</Button>
	);
}
