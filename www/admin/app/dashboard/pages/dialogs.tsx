"use client";

import * as React from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Page } from "api/prisma/types";
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Input,
} from "@admin/src/components/ui/client";
import { trpcReact } from "@admin/src/utils/trpcReact";
import { FolderArrowDownIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Combobox } from "@admin/src/components";
import { TypographyMuted } from "@admin/src/components/ui/server";
import slugify from "slugify";
import { TRPCClientError } from "@trpc/client";

interface DialogProps {
	page: Page;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DeleteDialog(props: DialogProps) {
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

export function MoveDialog(props: DialogProps) {
	const allGroups = trpcReact.pages.getGroup.useQuery().data as Page[] | undefined;
	const groups = React.useMemo(
		() =>
			allGroups
				?.filter((group) => {
					return (
						props.page.parent_id !== group.id &&
						props.page.id !== group.id &&
						!group.url.startsWith(props.page.url + "/")
					);
				})
				.sort((a, b) => a.url.localeCompare(b.url)),
		[allGroups, props.page]
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
						groups?.map((group) => ({
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
						disabled={!newParentId}
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

const editSchema = z.object({
	name: z.string().nonempty(),
	slug: z
		.string()
		.nonempty({ message: " " })
		.refine((slug) => slugify(slug, slugifyOptions) === slug),
});
type EditDialogInputs = z.infer<typeof editSchema>;

const slugifyOptions: Parameters<typeof slugify>[1] = {
	lower: true,
	strict: true,
	locale: "en",
	remove: /[*+~.()'"!:@]/g,
};
function getSlugFromUrl(path: string) {
	const split = path.split("/");
	return split[split.length - 1]!;
}

export function EditDetailsDialog(props: DialogProps) {
	const mutation = trpcReact.pages.editPage.useMutation();

	const {
		register,
		handleSubmit,
		setValue,
		clearErrors,
		setError,
		formState: { errors },
	} = useForm<EditDialogInputs>({
		defaultValues: { name: props.page.name, slug: getSlugFromUrl(props.page.url) },
		resolver: zodResolver(editSchema),
	});
	const onSubmit: SubmitHandler<EditDialogInputs> = async (data) => {
		const split = props.page.url.split("/");
		split[split.length - 1] = data.slug;

		const newUrl = props.page.url === "/" ? "/" : split.join("/");

		try {
			await mutation.mutateAsync({
				id: props.page.id,
				newName: data.name,
				newUrl,
			});
			props.setOpen(false);
		} catch (error) {
			if (error instanceof TRPCClientError && error.data.code === "CONFLICT") {
				setError("slug", {
					type: "manual",
					message: `A page with path ${newUrl} already exists.`,
				});
			}
		}
	};

	React.useEffect(() => {
		if (props.open) {
			setValue("name", props.page.name);
			setValue("slug", getSlugFromUrl(props.page.url));
			clearErrors();
		}
	}, [props.open, props.page.name, props.page.url, setValue, clearErrors]);

	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent className="!max-w-sm">
				<DialogHeader>
					<DialogTitle>Edit details</DialogTitle>
				</DialogHeader>

				<form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
					<Input
						className="flex-row"
						label="Name"
						{...register("name", {
							onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
								setValue("slug", slugify(e.target.value, slugifyOptions)),
						})}
						error={!!errors.name}
					/>
					<Input
						className="flex-row"
						label="Slug"
						{...register("slug")}
						error={errors.slug?.message}
					/>

					<DialogFooter>
						<Button
							type="submit"
							loading={mutation.isLoading}
							icon={<PencilSquareIcon className="w-5" />}
						>
							Save
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
