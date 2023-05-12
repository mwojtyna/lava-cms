"use client";

import { Button, Input } from "@admin/src/components/ui/client";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { DocumentPlusIcon, FolderPlusIcon } from "@heroicons/react/24/solid";

export function PagesTableActions() {
	return (
		<div className="flex justify-between">
			<div className="flex gap-2">
				<Input icon={<MagnifyingGlassIcon className="w-4" />} />
			</div>
			<div className="flex gap-2">
				<Button icon={<DocumentPlusIcon className="w-5" />}>Page</Button>
				<Button variant={"secondary"} icon={<FolderPlusIcon className="w-5" />}>
					Group
				</Button>
			</div>
		</div>
	);
}
