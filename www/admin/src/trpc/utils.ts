import type { Page, Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { prisma } from "@/prisma/client";
import "server-only";

/** Handles trailing slash */
export async function findPage(
	url: string,
	include?: Prisma.PageInclude<DefaultArgs>,
): Promise<Page | null> {
	let page = await prisma.page.findUnique({
		where: {
			url,
			is_group: false,
		},
		include,
	});

	// Handle trailing slash
	if (!page && !url.endsWith("/")) {
		page = await prisma.page.findFirst({
			where: {
				url: url + "/",
				is_group: false,
			},
			include,
		});
	} else if (!page && url.endsWith("/")) {
		page = await prisma.page.findFirst({
			where: {
				url: url.replace(/\/$/, ""),
				is_group: false,
			},
			include,
		});
	}

	return page;
}

export function isTopLevelComponent(
	parentFieldId: string | null,
	parentArrayItemId: string | null,
) {
	return parentFieldId === null && parentArrayItemId === null;
}
