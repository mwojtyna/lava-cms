import { type ChangeEvent, useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { ActionIcon, Alert, Group, Modal, Stack, TextInput } from "@mantine/core";
import {
	ExclamationCircleIcon,
	LockClosedIcon,
	LockOpenIcon,
	PencilSquareIcon,
} from "@heroicons/react/24/outline";
import slugify from "slugify";
import { TRPCClientError } from "@trpc/client";
import { trpcReact } from "@admin/src/utils/trpcReact";
import { usePagePreferences } from "@admin/src/hooks/usePagePreferences";
import SubmitButton from "@admin/app/_components/SubmitButton";
import { type PagesModalProps, invalidUrls } from "./PageTree";

export default function EditPageModal(props: PagesModalProps) {
	const mutation = trpcReact.pages.editPage.useMutation();
	const { pagePreferences, setPagePreferences } = usePagePreferences(props.node.page.id);

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
			slug: getSlugFromUrl(props.node.page.url),
		},
	});
	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		const split = props.node.page.url.split("/");
		split[split.length - 1] = data.slug;

		const newUrl = props.node.page.url === "/" ? "/" : split.join("/");
		if (invalidUrls.includes(newUrl)) {
			setError("slug", {
				type: "value",
				message: `The resulting path ${newUrl} is not allowed.`,
			});
			return;
		}

		try {
			await mutation.mutateAsync({
				id: props.node.page.id,
				newName: data.name,
				newUrl: newUrl,
			});
		} catch (error) {
			if (error instanceof TRPCClientError && error.data.code === "CONFLICT") {
				setError("slug", {
					type: "manual",
					message: `A page with path ${newUrl} already exists.`,
				});
			} else if (error instanceof TRPCClientError && error.data.code === "BAD_REQUEST") {
				setError("slug", {
					type: "manual",
					message: "Slug is invalid.",
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
		const split = path.split("/");
		return split[split.length - 1]!;
	}

	useEffect(() => {
		if (props.isOpen && props.node.page) {
			setValue("name", props.node.page.name);
			setValue("slug", getSlugFromUrl(props.node.page.url));
			clearErrors();
		}
	}, [props.isOpen, props.node.page, clearErrors, setValue]);

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
								if (!pagePreferences.slugLocked) {
									setValue(
										"slug",
										slugify(e.target.value, {
											lower: true,
											strict: true,
											locale: "en",
										})
									);
									clearErrors("slug");
								}
							},
						})}
						error={errors.name?.message}
					/>
					{props.node.page.url !== "/" && (
						<TextInput
							label="Slug"
							withAsterisk
							rightSection={
								<ActionIcon
									onClick={() =>
										setPagePreferences({
											...pagePreferences,
											slugLocked: !pagePreferences.slugLocked,
										})
									}
								>
									{pagePreferences.slugLocked ? (
										<LockClosedIcon className="w-4" />
									) : (
										<LockOpenIcon className="w-4" />
									)}
								</ActionIcon>
							}
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
