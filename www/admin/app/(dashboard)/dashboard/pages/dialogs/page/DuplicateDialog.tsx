import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
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
import { type EditDialogProps, type EditDialogInputs, editDialogSchema } from "../types";
import { editPath, getSlugFromPath, NameSlugInput, removeSlugFromPath } from "../utils";

export function DuplicateDialog(props: EditDialogProps) {
	const mutation = trpc.pages.duplicatePage.useMutation();
	const [slugLocked, setSlugLocked] = React.useState(false);

	const form = useForm<EditDialogInputs>({
		resolver: zodResolver(editDialogSchema),
	});
	const onSubmit: SubmitHandler<EditDialogInputs> = (data) => {
		const newUrl = editPath(props.page.url, data.slug);
		mutation.mutate(
			{
				originId: props.page.id,
				name: data.name,
				url: newUrl,
				parentId: props.page.parent_id!,
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
			form.reset({
				name: props.page.name,
				slug: getSlugFromPath(props.page.url),
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.open]);

	return (
		<Dialog open={props.open} onOpenChange={props.setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Duplicate page &quot;{props.page.name}&quot;</DialogTitle>
				</DialogHeader>

				<FormProvider {...form}>
					<form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
						<NameSlugInput
							form={form}
							path={removeSlugFromPath(props.page.url)}
							slugLocked={slugLocked}
							setSlugLocked={setSlugLocked}
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
