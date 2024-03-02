import type { EditDialogProps } from "../types";
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
	DialogHeader,
	DialogFooter,
	Dialog,
	DialogContent,
	DialogTitle,
} from "@/src/components/ui/client/Dialog";
import { FormField, FormItem, FormControl, FormError } from "@/src/components/ui/client/Form";
import { trpc } from "@/src/utils/trpc";

export function MoveDialog(props: EditDialogProps) {
	const allGroupsQuery = trpc.pages.getAllGroups.useQuery(undefined, {
		enabled: props.open,
	});
	const allGroups = allGroupsQuery.data;

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
						}) satisfies ItemGroup,
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
							props.page.url.split("/").at(-1)!;

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
