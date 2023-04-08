import { type SubmitHandler, useForm } from "react-hook-form";
import { Group, Modal, Stack, TextInput } from "@mantine/core";
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
			newPath: props.page.path,
		});
		props.onClose();
	};

	return (
		<Modal opened={props.opened} onClose={props.onClose} title="Edit name" centered>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Stack spacing={"sm"}>
					<TextInput
						defaultValue={props.page.name}
						label="New name"
						data-autofocus
						withAsterisk
						{...register("name", { required: " " })}
						error={
							errors.name?.message ||
							(mutation.error?.message &&
								"A server error occurred. Open the console for more details.")
						}
					/>

					<Group position="right">
						<SubmitButton isLoading={mutation.isLoading}>Save</SubmitButton>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
}