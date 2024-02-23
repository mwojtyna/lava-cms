import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm, type SubmitHandler, FormProvider } from "react-hook-form";
import { Button } from "@/src/components/ui/client/Button";
import {
	DialogHeader,
	DialogFooter,
	Dialog,
	DialogContent,
	DialogTitle,
} from "@/src/components/ui/client/Dialog";
import { usePagePreferences } from "@/src/hooks/usePagePreferences";
import { trpc } from "@/src/utils/trpc";
import { type EditDialogProps, type EditDialogInputs, editDialogSchema } from "../types";
import { NameSlugInput, editUrl, getSlugFromUrl } from "../utils";

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
