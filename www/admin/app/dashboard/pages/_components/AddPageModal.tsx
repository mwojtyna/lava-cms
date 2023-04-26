import { type ChangeEvent, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { ActionIcon, Alert, Group, Modal, Stack, TextInput } from "@admin/src/components";
import {
	DocumentPlusIcon,
	ExclamationCircleIcon,
	LockClosedIcon,
	LockOpenIcon,
} from "@heroicons/react/24/outline";
import slugify from "slugify";
import { TRPCClientError } from "@trpc/client";
import { trpcReact } from "@admin/src/utils/trpcReact";
import SubmitButton from "@admin/app/_components/SubmitButton";
import { type PagesModalProps, invalidUrls } from "./PageTree";

function setSlug(name: string) {
	return slugify(name, {
		lower: true,
		strict: true,
		locale: "en",
	});
}

export default function AddPageModal(props: PagesModalProps) {
	const mutation = trpcReact.pages.addPage.useMutation();
	const [slugLocked, setSlugLocked] = useState(false);

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
		const url = props.node.page.url + (props.node.page.url !== "/" ? "/" : "") + data.slug;
		if (invalidUrls.includes(url)) {
			setError("slug", {
				type: "value",
				message: `The resulting path ${url} is not allowed.`,
			});
			return;
		}

		try {
			await mutation.mutateAsync({
				name: data.name,
				url: url,
				parent_id: props.node.page.id,
				order: props.node.children.length,
			});
		} catch (error) {
			if (error instanceof TRPCClientError && error.data.code === "CONFLICT") {
				setError("slug", {
					type: "manual",
					message: `A page with path ${url} already exists.`,
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

	return (
		<Modal opened={props.isOpen} onClose={props.onClose} title="Add page" centered>
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
								if (!slugLocked) {
									setValue("slug", setSlug(e.target.value));
									clearErrors("slug");
								}
							},
						})}
						error={errors.name?.message}
					/>
					<TextInput
						label="Slug"
						rightSection={
							<ActionIcon onClick={() => setSlugLocked(!slugLocked)}>
								{slugLocked ? (
									<LockClosedIcon className="w-4" />
								) : (
									<LockOpenIcon className="w-4" />
								)}
							</ActionIcon>
						}
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
