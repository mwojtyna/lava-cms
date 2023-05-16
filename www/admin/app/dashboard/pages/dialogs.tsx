"use client";

import * as React from "react";
import type { Page } from "api/prisma/types";
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@admin/src/components/ui/client";
import { trpcReact } from "@admin/src/utils/trpcReact";
import { TrashIcon } from "@heroicons/react/24/outline";

interface DialogProps {
	page: Page;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DeletePageDialog(props: DialogProps) {
	const mutation = trpcReact.pages.deletePage.useMutation();
	async function handleSubmit() {
		await mutation.mutateAsync({
			id: props.page.id,
		});
		props.setOpen(false);
	}

	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent className="!max-w-md" withCloseButton={false}>
				<DialogHeader>
					<DialogTitle>Delete {props.page.is_group ? "group" : "page"}?</DialogTitle>
					<DialogDescription>
						{props.page.is_group
							? "Are you sure you want to delete the group and all its pages? This action cannot be undone!"
							: "Are you sure you want to delete the page? This action cannot be undone!"}
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button variant={"ghost"} onClick={() => props.setOpen(false)}>
						No, don&apos;t delete
					</Button>
					<Button
						loading={mutation.isLoading}
						type="submit"
						variant={"destructive"}
						icon={<TrashIcon className="w-5" />}
						onClick={handleSubmit}
					>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
