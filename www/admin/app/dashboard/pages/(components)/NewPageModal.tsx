import type { ChangeEvent } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Alert, Group, Modal, Stack, TextInput } from "@mantine/core";
import { DocumentPlusIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import slugify from "slugify";
import { TRPCClientError } from "@trpc/client";
import { trpcReact } from "@admin/src/utils/trpcReact";
import SubmitButton from "@admin/app/(components)/SubmitButton";
import { useNewPageModal } from "@admin/src/data/stores/pages";

export default function NewPageModal() {
	const mutation = trpcReact.pages.addPage.useMutation();
	const modal = useNewPageModal();

	function setSlug(name: string) {
		return slugify(name, {
			lower: true,
			strict: true,
			locale: "en",
		});
	}

	interface Inputs {
		name: string;
		slug: string;
	}
	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		setError,
		clearErrors,
	} = useForm<Inputs>();
	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		try {
			await mutation.mutateAsync({
				name: data.name,
				url: modal.page?.url + (modal.page?.url !== "/" ? "/" : "") + data.slug,
				parent_id: modal.page?.id,
			});
		} catch (error) {
			if (error instanceof TRPCClientError && error.data.code === "CONFLICT") {
				setError("slug", {
					type: "manual",
					message: "This slug is already taken.",
				});
			} else {
				setError("root", {
					message: "An unexpected error occurred. Open the console for more details.",
				});
			}
			return;
		}

		modal.close();
	};

	return (
		<Modal opened={modal.isOpen} onClose={modal.close} title="Add page" centered>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Stack>
					{errors.root && (
						<Alert
							color="red"
							variant="filled"
							icon={<ExclamationCircleIcon className="w-5" />}
						>
							{errors.root.message}
						</Alert>
					)}
					<TextInput
						label="Name"
						data-autofocus
						withAsterisk
						{...register("name", {
							required: " ",
							onChange: (e: ChangeEvent<HTMLInputElement>) => {
								setValue("slug", setSlug(e.target.value));
								clearErrors("slug");
							},
						})}
						error={errors.name?.message}
					/>
					<TextInput
						label="Slug"
						variant="filled"
						withAsterisk
						{...register("slug", { required: " " })}
						error={errors.slug?.message}
					/>

					<Group position="right">
						<SubmitButton
							isLoading={mutation.isLoading}
							leftIcon={<DocumentPlusIcon className="w-5" />}
						>
							Add
						</SubmitButton>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
}
