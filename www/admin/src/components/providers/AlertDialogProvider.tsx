"use client";

import React, { useState } from "react";
import { AlertDialogContext, type AlertDialogState } from "@/src/hooks/useAlertDialog";
import { AlertDialog } from "../AlertDialog";

export function AlertDialogProvider({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	const [onSubmit, setOnSubmit] = useState<() => void>(() => {});

	const [state, setState] = useState<AlertDialogState>({
		setOpen,
		setOnSubmit,

		title: "Title",
		description: "Description",
		yesMessage: "Yes",
		noMessage: "No",
		icon: null,
	});

	return (
		<AlertDialogContext.Provider value={[state, setState]}>
			<AlertDialog {...state} open={open} setOpen={setOpen} onSubmit={onSubmit} />
			{children}
		</AlertDialogContext.Provider>
	);
}
