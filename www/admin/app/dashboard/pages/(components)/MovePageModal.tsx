import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { TrashIcon } from "@heroicons/react/24/outline";
import SubmitButton from "@admin/app/(components)/SubmitButton";
import { trpcReact } from "@admin/src/utils/trpcReact";
import type { PagesModalProps } from "./PageTree";

export default function MovePageModal(props: PagesModalProps) {
	const deleteMutation = trpcReact.pages.deletePage.useMutation();

	return (
		<Modal
			opened={props.isOpen}
			onClose={props.onClose}
			centered
			withCloseButton={false}
			title={
				<Text>
					Delete page <strong className="whitespace-nowrap">{props.page.url}</strong> and
					all its children?
				</Text>
			}
		>
			<Stack>
				<Text size="sm">
					Are you sure you want to delete the page? You will permanently lose all contents
					of the page and all its children!
				</Text>
				<Group position="right">
					<Button variant="default" onClick={props.onClose}>
						No, don&apos;t delete
					</Button>
					<SubmitButton
						isLoading={deleteMutation.isLoading}
						leftIcon={<TrashIcon className="w-4" />}
						color="red"
						onClick={async () => {
							await deleteMutation.mutateAsync({ id: props.page.id });
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
