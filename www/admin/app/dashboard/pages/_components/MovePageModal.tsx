import {
	type FormEventHandler,
	forwardRef,
	useMemo,
	useState,
	type ReactNode,
	useEffect,
} from "react";
import { Alert, Group, Modal, Select, Stack, Text } from "@mantine/core";
import { ExclamationCircleIcon, FolderArrowDownIcon } from "@heroicons/react/24/outline";
import type { Page } from "api/prisma/types";
import SubmitButton from "@admin/app/_components/SubmitButton";
import { trpcReact } from "@admin/src/utils/trpcReact";
import type { PagesModalProps } from "./PageTree";
import { TRPCClientError } from "@trpc/client";

interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
	image: string;
	label: string;
	description: string;
	page: Page;
}
const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
	({ image, label, description, page, ...others }: ItemProps, ref) => (
		<div ref={ref} {...others}>
			<Text>
				{page.name} <Text color="dimmed">{page.url}</Text>
			</Text>
		</div>
	)
);
SelectItem.displayName = "SelectItem";

export default function MovePageModal(props: PagesModalProps & { allPages: Page[] }) {
	const mutation = trpcReact.pages.movePage.useMutation();

	const data = useMemo(
		() =>
			props.allPages
				.filter((page) => {
					// If the current page is Root, then remove it if the page to be moved is a direct child of Root.
					// Else remove page if it is the page to be moved or if it is its child.
					if (page.url === "/") {
						return props.page.url.split("/").length > 2;
					} else {
						return (
							page.id !== props.page.id &&
							!page.url.startsWith(props.page.url + "/") &&
							props.page.parent_id !== page.id
						);
					}
				})
				.sort((a, b) => a.name.localeCompare(b.name))
				.map((page) => ({
					label: page.name,
					value: page.id,
					page: page,
				})),
		[props.allPages, props.page]
	);

	const [destinationId, setDestinationId] = useState<string | null>(null);
	const [error, setError] = useState<{ message: ReactNode; unexpected: boolean } | null>(null);

	const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault();
		setError(null);

		try {
			await mutation.mutateAsync({
				id: props.page.id,
				slug: props.page.url.split("/").pop()!,
				newParentId: destinationId!,
			});
		} catch (error) {
			if (error instanceof TRPCClientError && error.data.code === "CONFLICT") {
				const destinationUrl = data.find((data) => data.page.id === destinationId)!.page
					.url;

				const newPath =
					destinationUrl +
					(destinationUrl === "/" ? "" : "/") +
					props.page.url.split("/").pop()!;

				setError({
					message: (
						<>
							A page with path <strong>{newPath}</strong> already exists! Either
							change the slug or move it somewhere else.
						</>
					),
					unexpected: false,
				});
			} else {
				setError({
					message: "An unexpected error occurred. Open the console for more details.",
					unexpected: true,
				});
			}
			return;
		}

		props.onClose();
	};

	useEffect(() => {
		setError(null);
	}, [props.isOpen]);

	return (
		<Modal opened={props.isOpen} onClose={props.onClose} centered title="Move page">
			<form onSubmit={onSubmit}>
				<Stack>
					{error?.unexpected && (
						<Alert
							color="red"
							variant="filled"
							icon={<ExclamationCircleIcon className="w-5" />}
						>
							{error.message}
						</Alert>
					)}

					<Select
						value={destinationId}
						onChange={setDestinationId}
						label="Move to"
						maxDropdownHeight={window.innerHeight / 2.25}
						dropdownPosition="bottom"
						itemComponent={SelectItem}
						data={data}
						withinPortal
						searchable
						required
						error={!error?.unexpected && error?.message}
					/>
					<Group position="right">
						<SubmitButton
							leftIcon={<FolderArrowDownIcon className="w-5" />}
							isLoading={mutation.isLoading}
						>
							Move
						</SubmitButton>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
}
