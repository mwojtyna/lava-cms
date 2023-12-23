import { ArrowRightIcon, PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "../utils/styling";
import { ActionIcon, Input } from "./ui/client";

type Props = {
	value: string;
	children: React.ReactNode;

	inputProps?: Omit<React.ComponentProps<typeof Input>, "defaultValue">;
	submitButtonProps?: React.ComponentProps<typeof ActionIcon>;
	cancelButtonProps?: React.ComponentProps<typeof ActionIcon>;

	onSubmit: (value: string) => void;
} & (
	| {
			hasCustomEditButton: true;
			editing: boolean;
			setEditing: (editing: boolean) => void;
	  }
	| {
			hasCustomEditButton?: false;
			editButtonProps?: React.ComponentProps<typeof ActionIcon>;
	  }
);

export function EditableText(props: Props) {
	const [input, setInput] = useState(props.value);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [editing, setEditing] = useState(false);

	useEffect(() => {
		setInput(props.value);
	}, [props.value]);

	function handleCancel() {
		setInput(props.value);
		if (props.hasCustomEditButton) {
			props.setEditing(false);
		}
	}
	function handleSubmit(value: string) {
		props.onSubmit(value);
		if (props.hasCustomEditButton) {
			props.setEditing(false);
		}
	}

	return (
		<div className="flex w-full items-center gap-2">
			{!(props.hasCustomEditButton ? props.editing : editing) ? (
				<>
					{props.children}
					{!props.hasCustomEditButton && (
						<ActionIcon
							variant={"simple"}
							onClick={() => setEditing(true)}
							{...props.editButtonProps}
							className={cn(props.editButtonProps?.className, "ml-auto")}
						>
							<PencilSquareIcon className="w-5" data-testid="edit-btn" />
						</ActionIcon>
					)}
				</>
			) : (
				<>
					<Input
						{...props.inputProps}
						ref={inputRef}
						inputClassName={cn(
							"px-1 py-0 h-fit text-base rounded-sm !ring-0 w-full",
							props.inputProps?.className,
						)}
						defaultValue={props.value}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Escape") {
								e.preventDefault();
								handleCancel();
							} else if (e.key === "Enter") {
								e.preventDefault();
								handleSubmit(input);
							}
						}}
						autoFocus
					/>

					<ActionIcon
						variant={"simple"}
						onClick={() => handleSubmit(input)}
						aria-label="Save"
					>
						<ArrowRightIcon className="w-5" data-testid="save-btn" />
					</ActionIcon>

					<ActionIcon variant={"simple"} onClick={handleCancel} aria-label="Cancel">
						<XMarkIcon className="w-5" data-testid="cancel-btn" />
					</ActionIcon>
				</>
			)}
		</div>
	);
}
