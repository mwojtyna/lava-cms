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
	FormProvider,
	FormControl,
	FormError,
	FormField,
	FormItem,
	FormLabel,
	Input,
} from "@admin/src/components/ui/client";
import { trpcReact } from "@admin/src/utils/trpcReact";
import {
	DocumentPlusIcon,
	FolderArrowDownIcon,
	FolderPlusIcon,
	LockClosedIcon,
	LockOpenIcon,
	PencilSquareIcon,
	TrashIcon,
} from "@heroicons/react/24/outline";
import { Combobox } from "@admin/src/components";
import { TypographyMuted } from "@admin/src/components/ui/server";
import slugify from "slugify";
import { TRPCClientError } from "@trpc/client";
import { usePagePreferences } from "@admin/src/hooks";

interface AddDialogProps {
	group: Page;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
interface EditDialogProps {
	page: Page;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DeleteDialog(props: EditDialogProps) {
	const mutation = trpcReact.pages.deletePage.useMutation();
	const { preferences, setPreferences } = usePagePreferences(props.page.id);

	async function handleSubmit() {
		await mutation.mutateAsync({
			id: props.page.id,
		});
		setPreferences({ ...preferences, [props.page.id]: undefined });
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

interface MoveDialogInputs {
	newParentId: string;
}
export function MoveDialog(props: EditDialogProps) {
	const allGroups = trpcReact.pages.getAllGroups.useQuery(undefined, {
		refetchOnWindowFocus: false,
	}).data;
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

	const form = useForm<MoveDialogInputs>();
	const onSubmit: SubmitHandler<MoveDialogInputs> = async (data) => {
		try {
			await mutation.mutateAsync({
				id: props.page.id,
				newParentId: data.newParentId,
			});
			props.setOpen(false);
		} catch (error) {
			if (error instanceof TRPCClientError && error.data.code === "CONFLICT") {
				const destinationUrl = groups!.find((group) => group.id === data.newParentId)!.url;

				const newPath =
					destinationUrl +
					(destinationUrl === "/" ? "" : "/") +
					props.page.url.split("/").pop()!;

				form.setError("newParentId", {
					message: (
						<>
							A page with path <strong>{newPath}</strong> already exists! Either
							change the slug or move it somewhere else.
						</>
					) as unknown as string,
				});
			} else {
				form.setError("newParentId", {
					message: "An unexpected error occurred.",
				});
			}
		}
	};

	React.useEffect(() => {
		form.clearErrors();
	}, [props.open, form]);

	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent className="!max-w-sm">
				<DialogHeader>
					<DialogTitle>Move page</DialogTitle>
				</DialogHeader>

				<FormProvider {...form}>
					<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="newParentId"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Combobox
											className="w-full"
											contentProps={{
												align: "start",
												className: "w-[335px]",
												placeholder: "Search groups...",
											}}
											placeholder="Select a group..."
											notFoundContent="No groups found."
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
											aria-required
											{...field}
										/>
									</FormControl>
									<FormError />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="submit"
								disabled={form.watch("newParentId") === undefined}
								loading={mutation.isLoading}
								icon={<FolderArrowDownIcon className="w-5" />}
							>
								Move
							</Button>
						</DialogFooter>
					</form>
				</FormProvider>
			</DialogContent>
		</Dialog>
	);
}

const editDialogSchema = z.object({
	name: z.string().nonempty(),
	slug: z
		.string({ required_error: " " })
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

export function EditDetailsDialog(props: EditDialogProps) {
	const mutation = trpcReact.pages.editPage.useMutation();
	const { preferences, setPreferences } = usePagePreferences(props.page.id);

	const form = useForm<EditDialogInputs>({
		resolver: zodResolver(editDialogSchema),
	});
	const onSubmit: SubmitHandler<EditDialogInputs> = async (data) => {
		if (data.slug === "/" && props.page.is_group) {
			form.setError("slug", { message: "Groups cannot have slugs containing only '/'." });
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
				form.setError("slug", {
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
			form.setValue("name", props.page.name);
			form.setValue("slug", getSlugFromUrl(props.page.url));
			form.clearErrors();
		}
	}, [props.open, props.page.name, props.page.url, form]);

	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent className="!max-w-sm">
				<DialogHeader>
					<DialogTitle>Edit details</DialogTitle>
				</DialogHeader>

				<FormProvider {...form}>
					<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="name"
							rules={{
								onChange: (e) => {
									if (!preferences[props.page.id])
										form.setValue(
											"slug",
											"/" + slugify(e.target.value, slugifyOptions)
										);
								},
							}}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input className="flex-row" aria-required {...field} />
									</FormControl>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="slug"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Slug</FormLabel>
									<FormControl>
										<Input
											className="flex-row"
											rightButtonIconOn={<LockClosedIcon className="w-4" />}
											rightButtonIconOff={<LockOpenIcon className="w-4" />}
											rightButtonState={preferences[props.page.id]}
											setRightButtonState={(state) =>
												setPreferences({
													...preferences,
													[props.page.id]: state,
												})
											}
											rightButtonTooltip="Toggle lock slug autofill"
											aria-required
											{...field}
										/>
									</FormControl>
									<FormError />
								</FormItem>
							)}
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
				</FormProvider>
			</DialogContent>
		</Dialog>
	);
}

export function AddDialog(props: AddDialogProps & { isGroup: boolean }) {
	const mutation = trpcReact.pages.addPage.useMutation();
	const { preferences, setPreferences } = usePagePreferences(props.group.id);
	const [slugLocked, setSlugLocked] = React.useState(false);

	const form = useForm<EditDialogInputs>({
		resolver: zodResolver(editDialogSchema),
	});
	const onSubmit: SubmitHandler<EditDialogInputs> = async (data) => {
		const url = props.group.url + (props.group.url !== "/" ? "/" : "") + data.slug.slice(1);

		try {
			const id = await mutation.mutateAsync({
				name: data.name,
				url,
				parent_id: props.group.id,
				is_group: props.isGroup,
			});

			if (slugLocked) {
				setPreferences({
					...preferences,
					[id]: slugLocked,
				});
			}
			props.setOpen(false);
		} catch (error) {
			if (error instanceof TRPCClientError && error.data.code === "CONFLICT") {
				form.setError("slug", {
					type: "manual",
					message: (
						<>
							A {props.isGroup ? "group" : "page"} with path <strong>{url}</strong>{" "}
							already exists.
						</>
					) as unknown as string,
				});
			}
		}
	};

	React.useEffect(() => {
		setSlugLocked(false);
	}, [props.open]);

	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent className="!max-w-sm">
				<DialogHeader>
					<DialogTitle>Add {props.isGroup ? "group" : "page"}</DialogTitle>
				</DialogHeader>

				<FormProvider {...form}>
					<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="name"
							rules={{
								onChange: (e) => {
									if (!slugLocked) {
										form.setValue(
											"slug",
											"/" + slugify(e.target.value, slugifyOptions)
										);
									}
								},
							}}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input className="flex-row" aria-required {...field} />
									</FormControl>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="slug"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Slug</FormLabel>
									<FormControl>
										<Input
											className="flex-row"
											rightButtonIconOn={<LockClosedIcon className="w-4" />}
											rightButtonIconOff={<LockOpenIcon className="w-4" />}
											rightButtonState={slugLocked}
											setRightButtonState={(state) => setSlugLocked(state)}
											rightButtonTooltip="Toggle lock slug autofill"
											aria-required
											{...field}
										/>
									</FormControl>
									<FormError />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="submit"
								loading={mutation.isLoading}
								icon={
									props.isGroup ? (
										<FolderPlusIcon className="w-5" />
									) : (
										<DocumentPlusIcon className="w-5" />
									)
								}
							>
								Add
							</Button>
						</DialogFooter>
					</form>
				</FormProvider>
			</DialogContent>
		</Dialog>
	);
}
