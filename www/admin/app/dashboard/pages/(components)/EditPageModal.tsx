import { type ChangeEvent, useCallback, useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Alert, Group, Modal, Stack, TextInput } from "@mantine/core";
import { ExclamationCircleIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import slugify from "slugify";
import { TRPCClientError } from "@trpc/client";
import { trpcReact } from "@admin/src/utils/trpcReact";
import SubmitButton from "@admin/app/(components)/SubmitButton";
import { useEditPageModal } from "@admin/src/data/stores/pages";

export default function EditPageModal() {
	const mutation = trpcReact.pages.editPage.useMutation();
	const modal = useEditPageModal();

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
	} = useForm<Inputs>({
		defaultValues: {
			slug: getSlugFromUrl(modal.page?.url ?? ""),
		},
	});
	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		if (!modal.page) throw new Error("No page selected!");

		const split = modal.page.url.split("/");
		if (data.slug !== "/") split[split.length - 1] = data.slug;

		try {
			await mutation.mutateAsync({
				id: modal.page.id,
				newName: data.name,
				oldUrl: modal.page.url,
				newUrl: split.join("/"),
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

	function getSlugFromUrl(path: string) {
		if (path === "/") {
			return "/";
		}

		const split = path.split("/");
		return split[split.length - 1];
	}
	const makeSlug = useCallback(
		(name: string) => {
			if (modal.page?.url === "/") {
				return "/";
			}

			return slugify(name, {
				lower: true,
				strict: true,
				locale: "en",
			});
		},
		[modal.page?.url]
	);

	useEffect(() => {
		if (modal.isOpen && modal.page) {
			setValue("name", modal.page.name);
			setValue("slug", makeSlug(modal.page.name));
		}
	}, [modal.isOpen, modal.page, clearErrors, clearErrors, makeSlug, setValue]);

	return (
		<Modal opened={modal.isOpen} onClose={modal.close} title="Edit name" centered>
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
								setValue("slug", makeSlug(e.target.value));
								clearErrors("slug");
							},
						})}
						error={errors.name?.message}
					/>
					{modal.page?.url !== "/" && (
						<TextInput
							label="Slug"
							variant="filled"
							withAsterisk
							{...register("slug", { required: " " })}
							error={errors.slug?.message}
						/>
					)}

					<Group position="right">
						<SubmitButton
							isLoading={mutation.isLoading}
							leftIcon={<PencilSquareIcon className="w-5" />}
						>
							Save
						</SubmitButton>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
}
