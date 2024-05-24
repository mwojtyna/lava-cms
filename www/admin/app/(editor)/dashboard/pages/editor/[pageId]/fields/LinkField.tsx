import {
	ArrowPathRoundedSquareIcon,
	ArrowTopRightOnSquareIcon,
	TrashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";
import { ActionIcon } from "@/src/components/ui/client/ActionIcon";
import { Button } from "@/src/components/ui/client/Button";
import type { FormFieldProps } from "@/src/components/ui/client/Form";
import { Card } from "@/src/components/ui/server/Card";
import { TypographyMuted } from "@/src/components/ui/server/typography";
import { trpc } from "@/src/utils/trpc";
import { SelectLinkDialog } from "../dialogs/SelectLinkDialog";

export function LinkField(props: FormFieldProps<string>) {
	const { data: page, isLoading } = trpc.pages.getPageByUrl.useQuery(
		{ url: props.value },
		{
			staleTime: Infinity,
			enabled: props.value !== "",
		},
	);

	const [openDialog, setOpenDialog] = useState(false);

	return (
		<>
			{page ? (
				<Card className="flex-row justify-between !p-3">
					<div className="flex items-center gap-3">
						<span className="font-medium">{page.name}</span>
						<TypographyMuted>{page.url}</TypographyMuted>
					</div>

					<div className="flex gap-2">
						<ActionIcon variant={"simple"} tooltip="Open in new tab" asChild>
							<Link href={"/dashboard/pages/editor/" + page.id} target="_blank">
								<ArrowTopRightOnSquareIcon className="w-5" />
							</Link>
						</ActionIcon>

						<ActionIcon
							variant={"simple"}
							onClick={() => setOpenDialog(true)}
							tooltip="Change"
						>
							<ArrowPathRoundedSquareIcon className="w-5" />
						</ActionIcon>

						<ActionIcon
							variant={"simple"}
							onClick={() => props.onChange("")}
							tooltip="Delete"
						>
							<TrashIcon className="w-5 text-destructive/75 hover:text-destructive" />
						</ActionIcon>
					</div>
				</Card>
			) : (
				<Button
					variant={"outline"}
					onClick={() => setOpenDialog(true)}
					loading={isLoading && props.value !== ""}
				>
					Select page
				</Button>
			)}

			<SelectLinkDialog open={openDialog} setOpen={setOpenDialog} onSubmit={props.onChange} />
		</>
	);
}
