import { Button } from "./ui/client/Button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogDescription,
	DialogHeader,
	DialogFooter,
} from "./ui/client/Dialog";

export interface AlertDialogProps {
	icon?: React.ReactNode;
	title: React.ReactNode;
	description: React.ReactNode;
	yesMessage: string;
	noMessage: string;
	loading?: boolean;
	onSubmit: () => void;
	onCancel?: () => void;

	open: boolean;
	setOpen: (value: boolean) => void;
}

export function AlertDialog(props: AlertDialogProps) {
	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent className="max-w-md" withCloseButton={false}>
				<DialogHeader>
					<DialogTitle>{props.title}</DialogTitle>
					<DialogDescription>{props.description}</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button
						variant={"ghost"}
						onClick={() => {
							props.onCancel?.();
							props.setOpen(false);
						}}
					>
						{props.noMessage}
					</Button>
					<Button
						loading={props.loading}
						type="submit"
						variant={"destructive"}
						icon={props.icon}
						onClick={props.onSubmit}
					>
						{props.yesMessage}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
