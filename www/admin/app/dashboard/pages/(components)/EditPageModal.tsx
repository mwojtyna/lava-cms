import { type ChangeEvent, useCallback, useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Alert, Group, Modal, Stack, TextInput } from "@mantine/core";
import { ExclamationCircleIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import slugify from "slugify";
import { TRPCClientError } from "@trpc/client";
import { trpcReact } from "@admin/src/utils/trpcReact";
import SubmitButton from "@admin/app/(components)/SubmitButton";
import type { PagesModalProps } from "./PageTree";

export default function EditPageModal(props: PagesModalProps) {
	const mutation = trpcReact.pages.editPage.useMutation();

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

	function getSlugFromUrl(path: string) {
		if (path === "/") {
			return "/";
		}

		const split = path.split("/");
		return split[split.length - 1];
	}
	const makeSlug = useCallback(
		(name: string) => {
			if (props.page.url === "/") {
				return "/";
			}

			return slugify(name, {
				lower: true,
				strict: true,
				locale: "en",
			});
		},
		[props.page.url]
	);

	useEffect(() => {
		if (props.isOpen && props.page) {
			setValue("name", props.page.name);
			setValue("slug", makeSlug(props.page.name));
		}
	}, [props.isOpen, props.page, clearErrors, clearErrors, makeSlug, setValue]);

	return (
		<Modal opened={props.isOpen} onClose={props.onClose} title="Edit name" centered>
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
