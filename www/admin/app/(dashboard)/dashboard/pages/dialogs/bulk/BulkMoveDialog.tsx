import type { BulkEditDialogProps } from "../types";
import { FolderArrowDownIcon } from "@heroicons/react/24/outline";
import React from "react";
import { useForm, type SubmitHandler, FormProvider } from "react-hook-form";
import {
	type ItemGroup,
	type MoveDialogInputs,
	NewGroupSelect,
} from "@/src/components/DataTableDialogs";
import { Button } from "@/src/components/ui/client/Button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogHeader,
	DialogFooter,
} from "@/src/components/ui/client/Dialog";
import { FormField, FormItem, FormControl, FormError } from "@/src/components/ui/client/Form";
import { TypographyList } from "@/src/components/ui/server/typography";
import { trpc, trpcFetch } from "@/src/utils/trpc";

export function BulkMoveDialog(props: BulkEditDialogProps) {
	const allGroupsQuery = trpc.pages.getAllGroups.useQuery(undefined, {
		enabled: props.open,
	});
	const allGroups = allGroupsQuery.data;

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
						}) satisfies ItemGroup,
				),
		[allGroups, props.pages],
	);

	const form = useForm<MoveDialogInputs>();

	const mutation = trpc.pages.movePage.useMutation();
	const [loading, setLoading] = React.useState(false);

	const onSubmit: SubmitHandler<MoveDialogInputs> = async (data) => {
		try {
			setLoading(true);
			const query = await trpcFetch.pages.checkConflict.query({
				newParentId: form.watch("newParentId"),
				originalUrls: props.pages.map((page) => page.url),
			});
			setLoading(false);

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

	console.log(form.getValues());

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
										<NewGroupSelect
											groups={groups ?? []}
											loading={allGroupsQuery.isLoading}
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
