import { TrashIcon } from "@heroicons/react/24/outline";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogDescription,
} from "@admin/src/components/ui/client";
import { DialogHeader, DialogFooter, Button } from "./ui/client";
import type { UseTRPCMutationResult } from "@trpc/react-query/dist/shared";

interface Props<TData, TError, TVariables, TContext> {
	icon: React.ReactNode;
	title: React.ReactNode;
	description: React.ReactNode;
	yesMessage: string;
	noMessage: string;
	mutation: UseTRPCMutationResult<TData, TError, TVariables, TContext>;
	onSubmit: () => void;

	open: boolean;
	setOpen: (value: boolean) => void;
}

export function AlertDialog<TData, TError, TVariables, TContext>(
	props: Props<TData, TError, TVariables, TContext>,
) {
	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent className="!max-w-md" withCloseButton={false}>
				<DialogHeader>
					<DialogTitle>{props.title}</DialogTitle>
					<DialogDescription>{props.description}</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button variant={"ghost"} onClick={() => props.setOpen(false)}>
						{props.noMessage}
					</Button>
					<Button
						loading={props.mutation.isLoading}
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
