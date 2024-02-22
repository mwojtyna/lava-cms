import { cn } from "../utils/styling";
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
	className?: string;
	icon?: React.ReactNode;
	title: React.ReactNode;
	description: React.ReactNode;
	yesMessage: React.ReactNode;
	noMessage?: React.ReactNode;
	loading?: boolean;
	onSubmit: () => void;
	onCancel?: () => void;

	open: boolean;
	setOpen: (value: boolean) => void;
}

export function AlertDialog(props: AlertDialogProps) {
	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent className={cn("max-w-md", props.className)} withCloseButton={false}>
				<DialogHeader>
					<DialogTitle>{props.title}</DialogTitle>
					<DialogDescription>{props.description}</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					{props.noMessage && (
						<Button
							variant={"ghost"}
							onClick={() => {
								props.onCancel?.();
								props.setOpen(false);
							}}
						>
							{props.noMessage}
						</Button>
					)}
					<Button
						loading={props.loading}
						type="submit"
						variant={props.noMessage ? "destructive" : "default"}
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
