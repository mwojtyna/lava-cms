"use client";

import * as React from "react";
import {
	type SubmitHandler,
	useForm,
	type UseFormReturn,
	type Path,
	type PathValue,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Page } from "@admin/prisma/types";
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
	DocumentDuplicateIcon,
	DocumentPlusIcon,
	FolderArrowDownIcon,
	FolderPlusIcon,
	LockClosedIcon,
	LockOpenIcon,
	PencilSquareIcon,
	TrashIcon,
} from "@heroicons/react/24/outline";
import { Combobox } from "@admin/src/components";
import { TypographyList, TypographyMuted } from "@admin/src/components/ui/server";
import slugify from "slugify";
import { TRPCClientError } from "@trpc/client";
import { usePagePreferences } from "@admin/src/hooks";
import { trpc } from "@admin/src/utils/trpc";

interface AddDialogProps {
	group: Page;
	isGroup: boolean;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
interface EditDialogProps {
	page: Page;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
interface BulkEditDialogProps {
	pages: Page[];
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	onSubmit: () => void;
}

export function DeleteDialog(props: EditDialogProps) {
	const mutation = trpcReact.pages.deletePage.useMutation();
	const [preferences, setPreferences] = usePagePreferences(props.page.id);

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
export function BulkDeleteDialog(props: BulkEditDialogProps) {
	const mutation = trpcReact.pages.deletePage.useMutation();
	// const [preferences, setPreferences] = usePagePreferences(props.pages[0].id);

	async function handleSubmit() {
		const promises = props.pages.map((page) =>
			mutation.mutateAsync({
				id: page.id,
			})
		);
		await Promise.all(promises);
		// setPreferences({ ...preferences, [props.pages[0].id]: undefined });

		props.setOpen(false);
		props.onSubmit();
	}

	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent className="!max-w-sm" withCloseButton={false}>
				<DialogHeader>
					<DialogTitle>
						Delete {props.pages.length} item{props.pages.length > 1 && "s"}?
					</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete {props.pages.length} items? This action
						cannot be undone!
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
function NewParentSelect<T extends MoveDialogInputs>({
	form,
	groups,
	label,
}: {
	form: UseFormReturn<T>;
	groups?: Page[];
	label?: React.ReactNode;
}) {
	return (
		<FormField
			control={form.control}
			name={"newParentId" as Path<T>}
			render={({ field }) => (
				<FormItem>
					{label && <FormLabel>{label}</FormLabel>}
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
												{group.url === "" ? "/" : group.url}
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
	);
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
							An item with path{" "}
							<strong className="whitespace-nowrap">{newPath}</strong> already exists!
							Either change the slug or move it somewhere else.
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
					<DialogTitle>Move {props.page.is_group ? "group" : "page"}</DialogTitle>
				</DialogHeader>

				<FormProvider {...form}>
					<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
						<NewParentSelect form={form} groups={groups} />

						<DialogFooter>
							<Button
								type="submit"
								disabled={!form.watch("newParentId")}
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
export function BulkMoveDialog(props: BulkEditDialogProps) {
	const allGroups = trpcReact.pages.getAllGroups.useQuery(undefined, {
		refetchOnWindowFocus: false,
	}).data;
	const groups = React.useMemo(
		() =>
			allGroups
				?.filter((group) => {
					return (
						props.pages.every(
							(page) => page.parent_id !== group.id && page.id !== group.id
						) &&
						props.pages.reduce(
							(acc, curr) => acc && !group.url.startsWith(curr.url + "/"),
							true
						)
					);
				})
				.sort((a, b) => a.url.localeCompare(b.url)),
		[allGroups, props.pages]
	);

	const mutation = trpcReact.pages.movePage.useMutation();
	const [isConflictChecking, setIsConflictChecking] = React.useState(false);

	const form = useForm<MoveDialogInputs>();
	const onSubmit: SubmitHandler<MoveDialogInputs> = async (data) => {
		try {
			setIsConflictChecking(true);
			const { conflict, urls } = await trpc.pages.checkConflict.query({
				newParentId: data.newParentId,
				originalUrls: props.pages.map((page) => page.url),
			});
			setIsConflictChecking(false);

			if (conflict) {
				form.setError("newParentId", {
					message: (
						<>
							The following items already exist in the destination group:
							<TypographyList items={urls!} />
						</>
					) as unknown as string,
				});
				return;
			}

			const promises = props.pages.map((page) =>
				mutation.mutateAsync({ id: page.id, newParentId: data.newParentId })
			);
			await Promise.all(promises);

			props.setOpen(false);
			props.onSubmit();
		} catch (error) {
			form.setError("newParentId", {
				message: "An unexpected error occurred.",
			});
		}
	};

	React.useEffect(() => {
		form.clearErrors();
	}, [props.open, form]);

	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent className="!max-w-sm">
				<DialogHeader>
					<DialogTitle>
						Move {props.pages.length} item{props.pages.length > 1 && "s"}
					</DialogTitle>
				</DialogHeader>

				<FormProvider {...form}>
					<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
						<NewParentSelect form={form} groups={groups} />

						<DialogFooter>
							<Button
								type="submit"
								disabled={!form.watch("newParentId")}
								loading={mutation.isLoading || isConflictChecking}
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
function editUrl(url: string, newSlug: string) {
	const split = url.split("/");
	split[split.length - 1] = newSlug.slice(1);
	return split.join("/");
}

function NameSlugInput<T extends EditDialogInputs>({
	form,
	slugLocked,
	setSlugLocked,
}: {
	form: UseFormReturn<T>;
	slugLocked: boolean | undefined;
	setSlugLocked: (value: boolean) => void;
}) {
	return (
		<>
			<FormField
				control={form.control}
				name={"name" as Path<T>}
				rules={{
					onChange: (e) => {
						if (!slugLocked)
							form.setValue(
								"slug" as Path<T>,
								("/" + slugify(e.target.value, slugifyOptions)) as PathValue<
									T,
									Path<T>
								>
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
				name={"slug" as Path<T>}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Slug</FormLabel>
						<FormControl>
							<Input
								className="flex-row"
								rightButtonIconOn={<LockClosedIcon className="w-4" />}
								rightButtonIconOff={<LockOpenIcon className="w-4" />}
								rightButtonState={slugLocked}
								setRightButtonState={setSlugLocked}
								rightButtonTooltip="Toggle lock slug autofill"
								aria-required
								{...field}
							/>
						</FormControl>
						<FormError />
					</FormItem>
				)}
			/>
		</>
	);
}

export function EditDetailsDialog(props: EditDialogProps) {
	const mutation = trpcReact.pages.editPage.useMutation();
	const [preferences, setPreferences] = usePagePreferences(props.page.id);

	const form = useForm<EditDialogInputs>({
		resolver: zodResolver(editDialogSchema),
	});
	const onSubmit: SubmitHandler<EditDialogInputs> = async (data) => {
		if (data.slug === "/" && props.page.is_group) {
			form.setError("slug", { message: "Groups cannot have slugs containing only '/'." });
			return;
		}

		const newUrl = editUrl(props.page.url, data.slug);

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
							An item with path{" "}
							<strong className="whitespace-nowrap">{newUrl}</strong> already exists.
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
						<NameSlugInput
							form={form}
							slugLocked={preferences[props.page.id]}
							setSlugLocked={(value) =>
								setPreferences({ ...preferences, [props.page.id]: value })
							}
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

export function AddDialog(props: AddDialogProps) {
	const mutation = trpcReact.pages.addPage.useMutation();
	const [preferences, setPreferences] = usePagePreferences(props.group.id);
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
					[id!]: slugLocked,
				});
			}
			props.setOpen(false);
		} catch (error) {
			if (error instanceof TRPCClientError && error.data.code === "CONFLICT") {
				form.setError("slug", {
					type: "manual",
					message: (
						<>
							An item with path <strong className="whitespace-nowrap">{url}</strong>{" "}
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
						<NameSlugInput
							form={form}
							slugLocked={slugLocked}
							setSlugLocked={setSlugLocked}
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

const duplicateDialogSchema = editDialogSchema.extend({
	newParentId: z.string().nonempty().cuid(),
});
type DuplicateDialogInputs = z.infer<typeof duplicateDialogSchema>;

export function DuplicateDialog(props: EditDialogProps) {
	const groups = trpcReact.pages.getAllGroups.useQuery(undefined, {
		refetchOnWindowFocus: false,
	}).data;
	const sortedGroups = React.useMemo(
		() => groups?.sort((a, b) => a.url.localeCompare(b.url)),
		[groups]
	);

	const mutation = trpcReact.pages.addPage.useMutation();
	const [preferences, setPreferences] = usePagePreferences(props.page.id);
	const [slugLocked, setSlugLocked] = React.useState(false);

	const form = useForm<DuplicateDialogInputs>({
		resolver: zodResolver(duplicateDialogSchema),
	});
	const onSubmit: SubmitHandler<DuplicateDialogInputs> = async (data) => {
		const newParent = groups?.find((group) => group.id === data.newParentId);
		const url = newParent?.url + data.slug;

		try {
			const id = await mutation.mutateAsync({
				name: data.name,
				url: url,
				parent_id: data.newParentId,
				is_group: false,
			});

			if (slugLocked) {
				setPreferences({
					...preferences,
					[id!]: slugLocked,
				});
			}
			props.setOpen(false);
		} catch (error) {
			if (error instanceof TRPCClientError && error.data.code === "CONFLICT") {
				form.setError("slug", {
					type: "manual",
					message: (
						<>
							An item with path <strong className="whitespace-nowrap">{url}</strong>{" "}
							already exists.
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
			form.setValue("newParentId", props.page.parent_id!);
			form.clearErrors();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.open, form]);

	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent className="!max-w-sm">
				<DialogHeader>
					<DialogTitle>Duplicate page</DialogTitle>
				</DialogHeader>

				<FormProvider {...form}>
					<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
						<NameSlugInput
							form={form}
							slugLocked={slugLocked}
							setSlugLocked={setSlugLocked}
						/>
						<NewParentSelect form={form} groups={sortedGroups} label="Group" />

						<DialogFooter>
							<Button
								type="submit"
								loading={mutation.isLoading}
								icon={<DocumentDuplicateIcon className="w-5" />}
							>
								Duplicate
							</Button>
						</DialogFooter>
					</form>
				</FormProvider>
			</DialogContent>
		</Dialog>
	);
}
