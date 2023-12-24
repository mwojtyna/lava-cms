"use client";

import { ArrowPathIcon } from "@heroicons/react/24/outline";
import React from "react";
import { Button } from "@/src/components/ui/client";
import { usePageEditor } from "@/src/data/stores/pageEditor";

export function ResetButton() {
	const { isDirty, reset } = usePageEditor();

	return (
		<Button
			className="flex-row-reverse"
			variant={"secondary"}
			icon={<ArrowPathIcon className="w-5" />}
			disabled={!isDirty}
			onClick={reset}
		>
			Reset
		</Button>
	);
}
