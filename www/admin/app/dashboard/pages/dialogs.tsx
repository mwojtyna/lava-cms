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
import type { Page } from "@prisma/client";
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
import { trpc } from "@admin/src/utils/trpc";
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
import { AlertDialog, Combobox } from "@admin/src/components";
import { TypographyList, TypographyMuted } from "@admin/src/components/ui/server";
import slugify from "slugify";
import { usePagePreferences } from "@admin/src/hooks";

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
	const mutation = trpc.pages.deletePage.useMutation();
	const [preferences, setPreferences] = usePagePreferences(props.page.id);

	async function handleSubmit() {
		await mutation.mutateAsync({
			id: props.page.id,
		});
		setPreferences({ ...preferences, [props.page.id]: undefined });
		props.setOpen(false);
	}

	return (
		<AlertDialog
			open={props.open}
			setOpen={props.setOpen}
			mutation={mutation}
			icon={<TrashIcon className="w-5" />}
			title={`Delete ${props.page.is_group ? "group" : "page"} "${props.page.name}"?`}
			description={
				props.page.is_group
					? "Are you sure you want to delete the group and all its pages? This action cannot be undone!"
					: "Are you sure you want to delete the page? This action cannot be undone!"
			}
			noMessage="No, don't delete"
			yesMessage="Delete"
			onSubmit={handleSubmit}
		/>
	);
}
export function BulkDeleteDialog(props: BulkEditDialogProps) {
	const mutation = trpc.pages.deletePage.useMutation();
	// const [preferences, setPreferences] = usePagePreferences(props.pages[0].id);

	async function handleSubmit() {
		const promises = props.pages.map((page) =>
			mutation.mutateAsync({
				id: page.id,
			}),
		);
		await Promise.all(promises);
		// setPreferences({ ...preferences, [props.pages[0].id]: undefined });

		props.setOpen(false);
		props.onSubmit();
	}

	return (
		<AlertDialog
			open={props.open}
			setOpen={props.setOpen}
			mutation={mutation}
			icon={<TrashIcon className="w-5" />}
			title={`Delete ${props.pages.length} items?`}
			description={`Are you sure you want to delete ${props.pages.length} items? This action cannot be undone!`}
			noMessage="No, don't delete"
			yesMessage="Delete"
			onSubmit={handleSubmit}
		/>
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
	const allGroups = trpc.pages.getAllGroups.useQuery().data;
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
		[allGroups, props.page],
	);
	const mutation = trpc.pages.movePage.useMutation();

	const form = useForm<MoveDialogInputs>();
	const onSubmit: SubmitHandler<MoveDialogInputs> = (data) => {
		mutation.mutate(
			{
				id: props.page.id,
				newParentId: data.newParentId,
			},
			{
				onSuccess: () => props.setOpen(false),
				onError: (err) => {
					if (err.data?.code === "CONFLICT") {
						const destinationUrl = groups!.find(
							(group) => group.id === data.newParentId,
						)!.url;

						const newPath =
							destinationUrl +
							(destinationUrl === "/" ? "" : "/") +
							props.page.url.split("/").pop()!;

						form.setError("newParentId", {
							message: (
								<>
									An item with path{" "}
									<strong className="whitespace-nowrap">{newPath}</strong> already
									exists! Either change the slug or move it somewhere else.
								</>
							) as unknown as string,
						});
					} else {
						form.setError("newParentId", {
							message: "An unexpected error occurred.",
						});
					}
				},
			},
		);
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
	const allGroups = trpc.pages.getAllGroups.useQuery().data;
	const groups = React.useMemo(
		() =>
			allGroups
				?.filter((group) => {
					return (
						props.pages.every(
							(page) => page.parent_id !== group.id && page.id !== group.id,
						) &&
						props.pages.reduce(
							(acc, curr) => acc && !group.url.startsWith(curr.url + "/"),
							true,
						)
					);
				})
				.sort((a, b) => a.url.localeCompare(b.url)),
		[allGroups, props.pages],
	);

	const form = useForm<MoveDialogInputs>();

	const mutation = trpc.pages.movePage.useMutation();
	const conflictQuery = trpc.pages.checkConflict.useQuery(
		{
			newParentId: form.watch("newParentId"),
			originalUrls: props.pages.map((page) => page.url),
		},
		{
			enabled: false,
		},
	);

	const onSubmit: SubmitHandler<MoveDialogInputs> = async (data) => {
		try {
			const { data: query } = await conflictQuery.refetch();

			if (query?.conflict) {
				form.setError("newParentId", {
					message: (
						<>
							The following items already exist in the destination group:
							<TypographyList items={query.urls!} />
						</>
					) as unknown as string,
				});
				return;
			}

			const promises = props.pages.map((page) =>
				mutation.mutateAsync({ id: page.id, newParentId: data.newParentId }),
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
					onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
						if (!slugLocked)
							form.setValue(
								"slug" as Path<T>,
								("/" + slugify(e.target.value, slugifyOptions)) as PathValue<
									T,
									Path<T>
								>,
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
								rightButton={{
									state: !!slugLocked,
									setState: setSlugLocked,
									onClick: null,
									iconOn: <LockClosedIcon className="w-4" />,
									iconOff: <LockOpenIcon className="w-4" />,
									tooltip: "Toggle lock slug autofill",
								}}
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
	const mutation = trpc.pages.editPage.useMutation();
	const [preferences, setPreferences] = usePagePreferences(props.page.id);

	const form = useForm<EditDialogInputs>({
		resolver: zodResolver(editDialogSchema),
	});
	const onSubmit: SubmitHandler<EditDialogInputs> = (data) => {
		if (data.slug === "/" && props.page.is_group) {
			form.setError("slug", { message: "Groups cannot have slugs containing only '/'." });
			return;
		}
		const newUrl = editUrl(props.page.url, data.slug);

		mutation.mutate(
			{
				id: props.page.id,
				newName: data.name,
				newUrl,
			},
			{
				onSuccess: () => props.setOpen(false),
				onError: (err) => {
					if (err.data?.code === "CONFLICT") {
						form.setError("slug", {
							message: (
								<>
									An item with path{" "}
									<strong className="whitespace-nowrap">{newUrl}</strong> already
									exists.
								</>
							) as unknown as string,
						});
					}
				},
			},
		);
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
	const mutation = trpc.pages.addPage.useMutation();
	const [preferences, setPreferences] = usePagePreferences(props.group.id);
	const [slugLocked, setSlugLocked] = React.useState(false);

	const form = useForm<EditDialogInputs>({
		resolver: zodResolver(editDialogSchema),
	});
	const onSubmit: SubmitHandler<EditDialogInputs> = (data) => {
		const url = props.group.url + (props.group.url !== "/" ? "/" : "") + data.slug.slice(1);
		mutation.mutate(
			{
				name: data.name,
				url,
				parentId: props.group.id,
				isGroup: props.isGroup,
			},
			{
				onSuccess: (id) => {
					if (slugLocked) {
						setPreferences({
							...preferences,
							[id]: slugLocked,
						});
					}
					props.setOpen(false);
				},
				onError: (err) => {
					if (err.data?.code === "CONFLICT") {
						form.setError("slug", {
							type: "manual",
							message: (
								<>
									An item with path{" "}
									<strong className="whitespace-nowrap">{url}</strong> already
									exists.
								</>
							) as unknown as string,
						});
					}
				},
			},
		);
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
	const groups = trpc.pages.getAllGroups.useQuery(undefined, {
		refetchOnWindowFocus: false,
	}).data;
	const sortedGroups = React.useMemo(
		() => groups?.sort((a, b) => a.url.localeCompare(b.url)),
		[groups],
	);

	const mutation = trpc.pages.addPage.useMutation();
	const [preferences, setPreferences] = usePagePreferences(props.page.id);
	const [slugLocked, setSlugLocked] = React.useState(false);

	const form = useForm<DuplicateDialogInputs>({
		resolver: zodResolver(duplicateDialogSchema),
	});
	const onSubmit: SubmitHandler<DuplicateDialogInputs> = (data) => {
		const newParent = groups!.find((group) => group.id === data.newParentId)!;
		const url = newParent.url + data.slug;

		mutation.mutate(
			{
				name: data.name,
				url,
				parentId: data.newParentId,
				isGroup: false,
			},
			{
				onSuccess: (id) => {
					if (slugLocked) {
						setPreferences({
							...preferences,
							[id]: slugLocked,
						});
					}
					props.setOpen(false);
				},
				onError: (err) => {
					if (err.data?.code === "CONFLICT") {
						form.setError("slug", {
							type: "manual",
							message: (
								<>
									An item with path{" "}
									<strong className="whitespace-nowrap">{url}</strong> already
									exists.
								</>
							) as unknown as string,
						});
					}
				},
			},
		);
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
