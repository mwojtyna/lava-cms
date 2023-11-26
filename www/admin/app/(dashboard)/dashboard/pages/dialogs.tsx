"use client";

// TODO: Refactor into multiple files like with component definitions

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
import { AlertDialog, NewParentSelect, type MoveDialogInputs } from "@admin/src/components";
import { TypographyList } from "@admin/src/components/ui/server";
import slugify from "slugify";
import { usePagePreferences } from "@admin/src/hooks";
import type { ItemParent } from "@admin/src/components/DataTableDialogs";

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
			loading={mutation.isLoading}
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
	const [loading, setLoading] = React.useState(false);
	// const [preferences, setPreferences] = usePagePreferences(props.pages[0].id);

	async function handleSubmit() {
		const promises = props.pages.map((page) =>
			mutation.mutateAsync({
				id: page.id,
			}),
		);
		setLoading(true);
		await Promise.all(promises);
		setLoading(false);
		// setPreferences({ ...preferences, [props.pages[0].id]: undefined });

		props.setOpen(false);
		props.onSubmit();
	}

	return (
		<AlertDialog
			open={props.open}
			setOpen={props.setOpen}
			loading={loading}
			icon={<TrashIcon className="w-5" />}
			title={`Delete ${props.pages.length} items?`}
			description={`Are you sure you want to delete ${props.pages.length} items? This action cannot be undone!`}
			noMessage="No, don't delete"
			yesMessage="Delete"
			onSubmit={handleSubmit}
		/>
	);
}

export function MoveDialog(props: EditDialogProps) {
	const allGroups = trpc.pages.getAllGroups.useQuery(undefined, {
		enabled: props.open,
	}).data;
	const groups = React.useMemo(
		() =>
			allGroups
				?.filter(
					(group) =>
						props.page.parent_id !== group.id &&
						props.page.id !== group.id &&
						!group.url.startsWith(props.page.url + "/"),
				)
				.map(
					(group) =>
						({
							id: group.id,
							name: group.name,
							extraInfo: group.url === "" ? "/" : group.url,
						}) satisfies ItemParent,
				),
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
						)!.extraInfo;

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
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						Move {props.page.is_group ? "group" : "page"} &quot;{props.page.name}&quot;
					</DialogTitle>
				</DialogHeader>

				<FormProvider {...form}>
					<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="newParentId"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<NewParentSelect parents={groups ?? []} {...field} />
									</FormControl>
									<FormError />
								</FormItem>
							)}
						/>

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
	const allGroups = trpc.pages.getAllGroups.useQuery(undefined, {
		enabled: props.open,
	}).data;
	const groups = React.useMemo(
		() =>
			allGroups
				?.filter(
					(group) =>
						props.pages.every(
							(page) => page.parent_id !== group.id && page.id !== group.id,
						) &&
						props.pages.reduce(
							(acc, curr) => acc && !group.url.startsWith(curr.url + "/"),
							true,
						),
				)
				.map(
					(group) =>
						({
							id: group.id,
							name: group.name,
							extraInfo: group.url === "" ? "/" : group.url,
						}) satisfies ItemParent,
				),
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
	const [loading, setLoading] = React.useState(false);

	const onSubmit: SubmitHandler<MoveDialogInputs> = async (data) => {
		try {
			const { data: query } = await conflictQuery.refetch();
			if (query?.conflict) {
				form.setError("newParentId", {
					message: (
						<>
							The following items already exist in the destination group:
							<TypographyList items={query.urls} />
						</>
					) as unknown as string,
				});
				return;
			}

			const promises = props.pages.map((page) =>
				mutation.mutateAsync({
					id: page.id,
					newParentId: data.newParentId,
				}),
			);
			setLoading(true);
			await Promise.all(promises);
			setLoading(false);

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
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						Move {props.pages.length} item{props.pages.length > 1 && "s"}
					</DialogTitle>
				</DialogHeader>

				<FormProvider {...form}>
					<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="newParentId"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<NewParentSelect parents={groups ?? []} {...field} />
									</FormControl>
									<FormError />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="submit"
								disabled={!form.watch("newParentId")}
								loading={loading}
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
	name: z.string().min(1),
	slug: z
		.string({ required_error: " " })
		.min(1, { message: " " })
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
			<DialogContent>
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
								Edit
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
			<DialogContent>
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
	newParentId: z.string().min(1).cuid(),
});
type DuplicateDialogInputs = z.infer<typeof duplicateDialogSchema>;

export function DuplicateDialog(props: EditDialogProps) {
	const allGroups = trpc.pages.getAllGroups.useQuery(undefined, {
		enabled: props.open,
	}).data;
	const groups = React.useMemo(
		() =>
			allGroups?.map(
				(group) =>
					({
						id: group.id,
						name: group.name,
						extraInfo: group.url === "" ? "/" : group.url,
					}) satisfies ItemParent,
			),
		[allGroups],
	);

	const mutation = trpc.pages.addPage.useMutation();
	const [preferences, setPreferences] = usePagePreferences(props.page.id);
	const [slugLocked, setSlugLocked] = React.useState(false);

	const form = useForm<DuplicateDialogInputs>({
		resolver: zodResolver(duplicateDialogSchema),
	});
	const onSubmit: SubmitHandler<DuplicateDialogInputs> = (data) => {
		const newParent = allGroups!.find((group) => group.id === data.newParentId)!;
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
			form.reset({
				name: props.page.name,
				slug: getSlugFromUrl(props.page.url),
				newParentId: props.page.parent_id!,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.open]);

	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent>
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
						<FormField
							control={form.control}
							name="newParentId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Group</FormLabel>
									<FormControl>
										<NewParentSelect parents={groups ?? []} {...field} />
									</FormControl>
									<FormError />
								</FormItem>
							)}
						/>

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
