import { memo, useState } from "react";
import { AlertDialog, type AlertDialogProps } from "../components/AlertDialog";
import "client-only";

type Props = Pick<AlertDialogProps, "title" | "description" | "yesMessage" | "noMessage" | "icon">;

function useAlertDialog(dialogProps: Props): {
	Component: React.MemoExoticComponent<() => JSX.Element>;
	open: (onYes: () => void) => void;
} {
	const [open, setOpen] = useState(false);
	const [onSubmit, setOnSubmit] = useState<(() => void) | null>(null);

	const Component = memo(() => (
		<AlertDialog
			{...dialogProps}
			open={open}
			setOpen={setOpen}
			onSubmit={onSubmit ?? (() => console.warn("No onSubmit callback provided"))}
		/>
	));
	Component.displayName = AlertDialog.name;

	return {
		Component,
		open: (onConfirm) => {
			setOpen(true);
			setOnSubmit(() => {
				return () => {
					setOpen(false);
					onConfirm();
				};
			});
		},
	};
}

export { useAlertDialog };
