"use client";

import { ArrowPathIcon } from "@heroicons/react/24/outline";
import React from "react";
import { Button } from "@/src/components/ui/client/Button";
import { usePageEditorStore } from "@/src/data/stores/pageEditor";

export function ResetButton() {
	const { isDirty, reset } = usePageEditorStore((state) => ({
		isDirty: state.isDirty,
		reset: state.reset,
	}));

	return (
		<Button
			className="flex-row-reverse max-md:hidden max-sm:p-3"
			variant={"secondary"}
			icon={<ArrowPathIcon className="w-5" />}
			disabled={!isDirty}
			onClick={reset}
		>
			Reset
		</Button>
	);
}
