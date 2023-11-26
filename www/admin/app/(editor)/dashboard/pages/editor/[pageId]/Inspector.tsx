"use client";

import { useState } from "react";
import { Button } from "@admin/src/components/ui/client";
import { TypographyH1, TypographyMuted } from "@admin/src/components/ui/server";
import { PlusIcon } from "@heroicons/react/24/outline";
import type { Page } from "@prisma/client";
import { AddComponentDialog } from "./dialogs/AddComponentDialog";

interface Props {
	page: Page;
}
export function Inspector(props: Props) {
	const [openAdd, setOpenAdd] = useState(false);

	return (
		<div className="space-y-6 border-l border-border p-4">
			<div>
				<TypographyH1 className="text-4xl">{props.page.name}</TypographyH1>
				<TypographyMuted className="text-base">{props.page.url}</TypographyMuted>
			</div>

			<Button
				className="w-full"
				variant={"outline"}
				icon={<PlusIcon className="w-5" />}
				onClick={() => setOpenAdd(true)}
			>
				Add component
			</Button>

			<AddComponentDialog open={openAdd} setOpen={setOpenAdd} />
		</div>
	);
}
