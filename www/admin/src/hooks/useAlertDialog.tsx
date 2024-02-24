import { createContext, useContext } from "react";
import { type AlertDialogProps } from "../components/AlertDialog";
import "client-only";

type AlertDialogOptions = Pick<
	AlertDialogProps,
	| "className"
	| "title"
	| "description"
	| "yesMessage"
	| "noMessage"
	| "icon"
	| "disableCloseOnBlur"
>;
type AlertDialogState = AlertDialogOptions & {
	setOpen: (value: boolean) => void;
	setOnSubmit: (value: () => void) => void;
};

const AlertDialogContext = createContext<
	[AlertDialogState, React.Dispatch<React.SetStateAction<AlertDialogState>>] | null
>(null);

function useAlertDialog(options: AlertDialogOptions | (() => AlertDialogOptions)): {
	open: (onYes: () => void) => void;
} {
	const context = useContext(AlertDialogContext);
	const state = context![0];
	const setState = context![1];

	return {
		open: (onConfirm) => {
			// Set dialog properties
			const newOptions = typeof options === "function" ? options() : options;
			setState((state) => ({
				...state,
				...newOptions,
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
