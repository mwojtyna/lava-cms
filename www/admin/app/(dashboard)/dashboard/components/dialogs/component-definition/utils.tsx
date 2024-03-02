import type { inferRouterOutputs } from "@trpc/server";
import { FolderIcon } from "@heroicons/react/24/outline";
import { ComponentFieldType } from "@prisma/client";
import type { ItemGroup } from "@/src/components/DataTableDialogs";
import type { PrivateRouter } from "@/src/trpc/routes/private/_private";

export function groupsToComboboxEntries(
	groups: inferRouterOutputs<PrivateRouter>["components"]["getAllGroups"],
): ItemGroup[] {
	return groups.map((group) => ({
		id: group.id,
		name: group.name,
		extraInfo: (
			<span className="flex items-center">
				{group.parent_group_name && (
					<>
						in&nbsp;
						<FolderIcon className="inline w-[14px]" />
						&nbsp;
						{group.parent_group_name},&nbsp;
					</>
				)}
				contains {group.children_count.toString()}{" "}
				{group.children_count === 1 ? "item" : "items"}
			</span>
		),
	}));
}

export function snakeCaseToTitleCase(input: string): string {
	const words = input.split("_");
	const correctedCase = words.map(
		(word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
	);

	return correctedCase.join(" ");
}

export const fieldTypeMap: Record<string, string> = Object.values(ComponentFieldType).reduce<
	Record<string, string>
>((acc, type) => {
	const split: string[] = [];
	for (const word of type.split("_")) {
		const part = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		split.push(part);
	}

	acc[type] = split.join(" ");
	return acc;
}, {});
