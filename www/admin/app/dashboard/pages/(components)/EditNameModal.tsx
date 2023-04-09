import type { ChangeEvent } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Alert, Group, Modal, Stack, TextInput } from "@mantine/core";
import slugify from "slugify";
import { TRPCClientError } from "@trpc/client";
import type { Page } from "api/prisma/types";
import { trpcReact } from "@admin/src/utils/trpcReact";
import SubmitButton from "@admin/app/(components)/SubmitButton";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

interface Props {
	opened: boolean;
	onClose: () => void;
	page: Page;
}

export function EditNameModal(props: Props) {
	const mutation = trpcReact.pages.editPage.useMutation();

	function getSlugFromUrl(path: string) {
		if (path === "/") {
			return "/";
		}

		const split = path.split("/");
		return split[split.length - 1];
	}
	function setSlug(name: string) {
		if (props.page.url === "/") {
			return "/";
		}

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
	} = useForm<Inputs>({
		defaultValues: {
			slug: getSlugFromUrl(props.page.url),
		},
	});
	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		const split = props.page.url.split("/");
		if (data.slug !== "/") split[split.length - 1] = data.slug;

		try {
			await mutation.mutateAsync({
				id: props.page.id,
				newName: data.name,
				oldUrl: props.page.url,
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

		props.onClose();
	};

	return (
		<Modal opened={props.opened} onClose={props.onClose} title="Edit name" centered>
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
						defaultValue={props.page.name}
						label="New name"
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
					{props.page.url !== "/" && (
						<TextInput
							label="Slug"
							variant="filled"
							withAsterisk
							{...register("slug", { required: " " })}
							error={errors.slug?.message}
						/>
					)}

					<Group position="right">
						<SubmitButton isLoading={mutation.isLoading}>Save</SubmitButton>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
}
