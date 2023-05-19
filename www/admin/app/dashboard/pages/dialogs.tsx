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
import {
	FolderArrowDownIcon,
	LockClosedIcon,
	LockOpenIcon,
	PencilSquareIcon,
	TrashIcon,
} from "@heroicons/react/24/outline";
import { Combobox } from "@admin/src/components";
import { TypographyMuted } from "@admin/src/components/ui/server";
import slugify from "slugify";
import { TRPCClientError } from "@trpc/client";
import { useLocalStorage } from "@mantine/hooks";

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
	const [error, setError] = React.useState<{
		message: React.ReactNode;
		unexpected: boolean;
	} | null>();

	async function handleSubmit() {
		try {
			await mutation.mutateAsync({
				id: props.page.id,
				newParentId,
			});
			props.setOpen(false);
		} catch (error) {
			if (error instanceof TRPCClientError && error.data.code === "CONFLICT") {
				const destinationUrl = groups!.find((group) => group.id === newParentId)!.url;

				const newPath =
					destinationUrl +
					(destinationUrl === "/" ? "" : "/") +
					props.page.url.split("/").pop()!;

				setError({
					message: (
						<>
							A page with path <strong>{newPath}</strong> already exists! Either
							change the slug or move it somewhere else.
						</>
					),
					unexpected: false,
				});
			} else {
				setError({
					message: "An unexpected error occurred.",
					unexpected: true,
				});
			}
		}
	}

	React.useEffect(() => {
		setError(null);
	}, [props.open]);

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
					error={error?.message}
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

const editDialogSchema = z.object({
	name: z.string().nonempty(),
	slug: z
		.string()
		.nonempty({ message: " " })
		.refine((slug) => "/" + slugify(slug, slugifyOptions) === slug, {
			message: "Invalid slug.",
		}),
});
type EditDialogInputs = z.infer<typeof editDialogSchema>;

const slugifyOptions: Parameters<typeof slugify>[1] = {
	lower: true,
	strict: true,
	locale: "en",
	remove: /[*+~.()'"!:@]/g,
};
function getSlugFromUrl(path: string) {
	const split = path.split("/");
	return "/" + split[split.length - 1]!;
}

export function EditDetailsDialog(props: DialogProps) {
	const mutation = trpcReact.pages.editPage.useMutation();
	const [slugLocked, setSlugLocked] = useLocalStorage({
		key: "slug-locked",
		defaultValue: {
			[props.page.id]: false,
		},
	});

	const {
		register,
		handleSubmit,
		setValue,
		clearErrors,
		setError,
		formState: { errors },
	} = useForm<EditDialogInputs>({
		resolver: zodResolver(editDialogSchema),
	});
	const onSubmit: SubmitHandler<EditDialogInputs> = async (data) => {
		if (data.slug === "/" && props.page.is_group) {
			setError("slug", { message: "Groups cannot have slugs containing only '/'." });
			return;
		}

		const split = props.page.url.split("/");
		split[split.length - 1] = data.slug.slice(1);
		const newUrl = split.join("/");

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
					message: (
						<>
							A page with path <strong>{newUrl}</strong> already exists.
						</>
					) as unknown as string,
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
							onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
								if (!slugLocked[props.page.id])
									setValue("slug", "/" + slugify(e.target.value, slugifyOptions));
							},
						})}
						error={!!errors.name}
					/>

					<Input
						className="flex-row"
						label="Slug"
						{...register("slug")}
						error={errors.slug?.message}
						rightButtonIconOn={<LockClosedIcon className="w-4" />}
						rightButtonIconOff={<LockOpenIcon className="w-4" />}
						onRightButtonClick={(state) =>
							setSlugLocked({
								...slugLocked,
								[props.page.id]: state,
							})
						}
						initialRightButtonState={slugLocked[props.page.id]}
						rightButtonTooltip="Toggle lock slug autofill"
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
