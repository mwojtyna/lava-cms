import { Alert, Button, Group, Modal, Stack, Text } from "@admin/src/components";
import { ExclamationCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import SubmitButton from "@admin/src/components/SubmitButton";
import { trpcReact } from "@admin/src/utils/trpcReact";
import type { PagesModalProps } from "./PageTree";
import type { LocalStorageData } from "./Page";

export default function DeletePageModal(props: PagesModalProps) {
	const mutation = trpcReact.pages.deletePage.useMutation();

	return (
		<Modal
			opened={props.isOpen}
			onClose={props.onClose}
			centered
			withCloseButton={false}
			title={
				<Text>
					Delete page <strong className="whitespace-nowrap">{props.node.page.url}</strong>{" "}
					and all its children?
				</Text>
			}
		>
			<Stack>
				{mutation.isError && (
					<Alert
						color="red"
						variant="filled"
						icon={<ExclamationCircleIcon className="w-5" />}
					>
						An unexpected error occurred. Open the console for more details.
					</Alert>
				)}

				<Text size="sm">
					Are you sure you want to delete the page? You will permanently lose all contents
					of the page and all its children!
				</Text>

				<Group position="right">
					<Button variant="default" onClick={props.onClose}>
						No, don&apos;t delete
					</Button>
					<SubmitButton
						isLoading={mutation.isLoading}
						leftIcon={<TrashIcon className="w-4" />}
						color="red"
						onClick={async () => {
							await mutation.mutateAsync({
								id: props.node.page.id,
								parent_id: props.node.page.parent_id!,
								order: props.node.page.order,
							});

							// Remove page preferences of deleted page from local storage
							const data = localStorage.getItem("page-tree");
							if (data) {
								const parsedData: LocalStorageData = JSON.parse(data);
								const { [props.node.page.id]: _, ...rest } = parsedData;

								localStorage.setItem("page-tree", JSON.stringify(rest));
							}

							props.onClose();
						}}
					>
						Delete
					</SubmitButton>
				</Group>
			</Stack>
		</Modal>
	);
}
