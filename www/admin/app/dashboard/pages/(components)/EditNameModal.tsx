import { type ChangeEvent, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Group, Modal, Stack, TextInput } from "@mantine/core";
import slugify from "slugify";
import type { Page } from "api/prisma/types";
import { trpcReact } from "@admin/src/utils/trpcReact";
import SubmitButton from "@admin/app/(components)/SubmitButton";

interface Props {
	opened: boolean;
	onClose: () => void;
	page: Page;
}

export function EditNameModal(props: Props) {
	const mutation = trpcReact.pages.editPage.useMutation();

	const [newPath, setNewPath] = useState(props.page.path);
	function changePath(name: string) {
		if (props.page.path === "/") {
			return "/";
		}

		const slug = slugify(name, {
			lower: true,
			strict: true,
			locale: "en",
		});
		const split = props.page.path.split("/");

		return props.page.path.replace(split[split.length - 1]!, slug);
	}

	interface Inputs {
		name: string;
	}
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Inputs>();
	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		await mutation.mutateAsync({
			id: props.page.id,
			newName: data.name,
			newPath: newPath,
		});
		props.onClose();
	};

	return (
		<Modal opened={props.opened} onClose={props.onClose} title="Edit name" centered>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Stack>
					<TextInput
						defaultValue={props.page.name}
						label="New name"
						data-autofocus
						withAsterisk
						{...register("name", {
							required: " ",
							onChange: (e: ChangeEvent<HTMLInputElement>) =>
								setNewPath(changePath(e.target.value)),
						})}
						error={
							errors.name?.message ||
							(mutation.error?.message &&
								"A server error occurred. Open the console for more details.")
						}
					/>
					<TextInput value={newPath} label="Path" variant="filled" disabled />

					<Group position="right">
						<SubmitButton isLoading={mutation.isLoading}>Save</SubmitButton>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
}
