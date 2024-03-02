"use client";

import type { UseVirtualFloatingOptions } from "@udecode/plate-floating";
import { cn } from "@udecode/cn";
import { flip, offset } from "@udecode/plate-floating";
import {
	FloatingLinkUrlInput,
	type LinkFloatingToolbarState,
	LinkOpenButton,
	useFloatingLinkEdit,
	useFloatingLinkEditState,
	useFloatingLinkInsert,
	useFloatingLinkInsertState,
} from "@udecode/plate-link";
import React from "react";

import { Button, buttonVariants } from "../ui/client/Button";
import { inputVariants } from "../ui/client/Input";
import { popoverVariants } from "../ui/client/Popover";
import { Separator } from "../ui/client/Separator";
import { icons } from "./icons";

const floatingOptions: UseVirtualFloatingOptions = {
	placement: "bottom-start",
	middleware: [
		offset(12),
		flip({
			padding: 12,
			fallbackPlacements: ["bottom-end", "top-start", "top-end"],
		}),
	],
};

export interface LinkFloatingToolbarProps {
	state?: LinkFloatingToolbarState;
}

export function LinkFloatingToolbar({ state }: LinkFloatingToolbarProps) {
	const insertState = useFloatingLinkInsertState({
		...state,
		floatingOptions: {
			...floatingOptions,
			...state?.floatingOptions,
		},
	});
	const {
		props: insertProps,
		ref: insertRef,
		hidden,
		textInputProps,
	} = useFloatingLinkInsert(insertState);

	const editState = useFloatingLinkEditState({
		...state,
		floatingOptions: {
			...floatingOptions,
			...state?.floatingOptions,
		},
	});
	const {
		props: editProps,
		ref: editRef,
		editButtonProps,
		unlinkButtonProps,
	} = useFloatingLinkEdit(editState);

	if (hidden) {
		return null;
	}

	const input = (
		<div className="flex w-[330px] flex-col">
			<div className="flex items-center">
				<div className="flex items-center pl-3 text-muted-foreground">
					<icons.Link className="h-4 w-4" />
				</div>

				<FloatingLinkUrlInput
					className={inputVariants({ variant: "ghost", size: "sm" })}
					placeholder="Paste link"
				/>
			</div>

			<Separator />

			<div className="flex items-center">
				<div className="flex items-center pl-3 text-muted-foreground">
					<icons.Text className="h-4 w-4" />
				</div>
				<input
					className={inputVariants({ variant: "ghost", size: "sm" })}
					placeholder="Text to display"
					{...textInputProps}
				/>
			</div>
		</div>
	);

	const editContent = editState.isEditing ? (
		input
	) : (
		<div className="box-content flex h-9 items-center gap-1">
			<Button variant={"ghost"} size="sm" {...editButtonProps}>
				Edit link
			</Button>

			<Separator orientation="vertical" />

			<LinkOpenButton
				className={buttonVariants({
					variant: "ghost",
					size: "sm",
				})}
			>
				<icons.ExternalLink width={18} />
			</LinkOpenButton>

			<Separator orientation="vertical" />

			<Button variant={"ghost"} size="sm" {...unlinkButtonProps}>
				<icons.Unlink width={18} />
			</Button>
		</div>
	);

	return (
		<>
			<div ref={insertRef} className={cn(popoverVariants(), "w-auto p-1")} {...insertProps}>
				{input}
			</div>

			<div ref={editRef} className={cn(popoverVariants(), "w-auto p-1")} {...editProps}>
				{editContent}
			</div>
		</>
	);
}
