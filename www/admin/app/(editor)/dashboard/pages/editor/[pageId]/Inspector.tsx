"use client";

import { useState } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import type { Page } from "@prisma/client";
import { Button } from "@admin/src/components/ui/client";
import { TypographyH1, TypographyMuted } from "@admin/src/components/ui/server";
import { PlusIcon } from "@heroicons/react/24/outline";
import type { PrivateRouter } from "@admin/src/trpc/routes/private/_private";
import { AddComponentDialog } from "./dialogs/AddComponentDialog";
import { Components } from "./Components";

interface Props {
	page: Page;
	components: inferRouterOutputs<PrivateRouter>["pages"]["getPageComponents"];
}
export function Inspector(props: Props) {
	const [openAdd, setOpenAdd] = useState(false);

	return (
		<>
			<div className="flex flex-col gap-5 border-l p-4">
				<div>
					<TypographyH1 className="text-4xl">{props.page.name}</TypographyH1>
					<TypographyMuted className="text-base">{props.page.url}</TypographyMuted>
				</div>

				<Components pageId={props.page.id} serverData={props.components} />
				<Button
					className="w-full"
					variant={"outline"}
					icon={<PlusIcon className="w-5" />}
					onClick={() => setOpenAdd(true)}
				>
					Add component
				</Button>
			</div>

			<AddComponentDialog
				open={openAdd}
				setOpen={setOpenAdd}
				onSubmit={(id) => console.log(id)}
			/>
		</>
	);
}
