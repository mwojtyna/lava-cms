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
import { FolderArrowDownIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Combobox } from "@admin/src/components";
import { TypographyMuted } from "@admin/src/components/ui/server";

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
			<DialogContent className="!max-w-sm" withCloseButton={false}>
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

export function MovePageDialog(props: DialogProps) {
	const allGroups = trpcReact.pages.getGroup.useQuery().data as Page[] | undefined;
	const allGroupsSorted = React.useMemo(
		() => allGroups?.sort((a, b) => a.url.localeCompare(b.url)),
		[allGroups]
	);
	const mutation = trpcReact.pages.movePage.useMutation();

	const [newParentId, setNewParentId] = React.useState("");
	async function handleSubmit() {
		await mutation.mutateAsync({
			id: props.page.id,
			newParentId,
		});
		props.setOpen(false);
	}

	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent className="!max-w-sm">
				<DialogHeader>
					<DialogTitle>Move page</DialogTitle>
				</DialogHeader>

				<Combobox
					className="w-full"
					contentProps={{
						align: "start",
						className: "w-[335px]",
						placeholder: "Search groups...",
					}}
					placeholder="Select a group..."
					data={
						allGroupsSorted?.map((group) => ({
							label: (
								<span className="flex items-baseline gap-2">
									<span>{group.name}</span>{" "}
									<TypographyMuted className="text-xs">
										{group.url}
									</TypographyMuted>
								</span>
							),
							value: group.id,
							filterValue: group.name,
						})) ?? []
					}
					onValueChange={setNewParentId}
				/>

				<DialogFooter>
					<Button
						loading={mutation.isLoading}
						onClick={handleSubmit}
						icon={<FolderArrowDownIcon className="w-5" />}
					>
						Move
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
