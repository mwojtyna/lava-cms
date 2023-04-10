import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { TrashIcon } from "@heroicons/react/24/outline";
import SubmitButton from "@admin/app/(components)/SubmitButton";
import { trpcReact } from "@admin/src/utils/trpcReact";
import { useDeletePageModal } from "@admin/src/data/stores/pages";

export default function DeletePageModal() {
	const deleteMutation = trpcReact.pages.deletePage.useMutation();
	const modal = useDeletePageModal();

	return (
		<Modal
			opened={modal.isOpen}
			onClose={modal.close}
			centered
			withCloseButton={false}
			title={
				<Text>
					Delete page <strong className="whitespace-nowrap">{modal.page?.url}</strong> and
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
					<Button variant="default" onClick={modal.close}>
						No, don&apos;t delete
					</Button>
					<SubmitButton
						isLoading={deleteMutation.isLoading}
						leftIcon={<TrashIcon className="w-4" />}
						color="red"
						onClick={async () => {
							if (!modal.page) throw new Error("No page selected!");

							await deleteMutation.mutateAsync({ id: modal.page.id });
							modal.close();
						}}
					>
						Delete
					</SubmitButton>
				</Group>
			</Stack>
		</Modal>
	);
}
