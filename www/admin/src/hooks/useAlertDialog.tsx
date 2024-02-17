import { createContext, useContext } from "react";
import { type AlertDialogProps } from "../components/AlertDialog";
import "client-only";

type AlertDialogOptions = Pick<
	AlertDialogProps,
	"title" | "description" | "yesMessage" | "noMessage" | "icon"
>;
type AlertDialogState = AlertDialogOptions & {
	setOpen: (value: boolean) => void;
	setOnSubmit: (value: () => void) => void;
};

const AlertDialogContext = createContext<
	[AlertDialogState, React.Dispatch<React.SetStateAction<AlertDialogState>>] | null
>(null);

function useAlertDialog(options: AlertDialogOptions): {
	open: (onYes: () => void) => void;
} {
	const context = useContext(AlertDialogContext);
	const state = context![0];
	const setState = context![1];

	return {
		open: (onConfirm) => {
			// Set dialog properties
			setState((state) => ({
				...state,
				...options,
			}));

			state.setOpen(true);
			state.setOnSubmit(() => {
				return () => {
					state.setOpen(false);
					onConfirm();
				};
			});
		},
	};
}

export { useAlertDialog, AlertDialogContext, type AlertDialogState };
