import type { Page } from "@prisma/client";
import { FolderPlusIcon, DocumentPlusIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm, type SubmitHandler, FormProvider } from "react-hook-form";
import { Button } from "@/src/components/ui/client/Button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogHeader,
	DialogFooter,
} from "@/src/components/ui/client/Dialog";
import { trpc } from "@/src/utils/trpc";
import { type EditDialogInputs, editDialogSchema } from "../types";
import { NameSlugInput } from "../utils";

interface AddDialogProps {
	group: Page;
	isGroup: boolean;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export function AddDialog(props: AddDialogProps) {
	const mutation = trpc.pages.addPage.useMutation();
	const [slugLocked, setSlugLocked] = React.useState(false);

	const form = useForm<EditDialogInputs>({
		resolver: zodResolver(editDialogSchema),
		defaultValues: {
			name: "",
			slug: "",
		},
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
				onSuccess: () => props.setOpen(false),
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
