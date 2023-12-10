import { TrashIcon } from "@heroicons/react/24/outline";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogDescription,
	DialogHeader,
	DialogFooter,
	Button,
} from "@/src/components/ui/client";

interface Props {
	icon: React.ReactNode;
	title: React.ReactNode;
	description: React.ReactNode;
	yesMessage: string;
	noMessage: string;
	loading: boolean;
	onSubmit: () => void;

	open: boolean;
	setOpen: (value: boolean) => void;
}

export function AlertDialog(props: Props) {
	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent className="max-w-md" withCloseButton={false}>
				<DialogHeader>
					<DialogTitle>{props.title}</DialogTitle>
					<DialogDescription>{props.description}</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button variant={"ghost"} onClick={() => props.setOpen(false)}>
						{props.noMessage}
					</Button>
					<Button
						loading={props.loading}
						type="submit"
						variant={"destructive"}
						icon={<TrashIcon className="w-5" />}
						onClick={props.onSubmit}
					>
						{props.yesMessage}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
