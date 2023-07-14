import { prisma } from "@admin/prisma/__mocks__/client";
import type { Page } from "@prisma/client";
import { expect, it, vi } from "vitest";
import { caller } from "../../_private";

vi.mock("@admin/prisma/client");

const PAGE_ID = "cju0q2q2h0000g0q2q2h00000";

function getPage(url: string) {
	const page: Page = {
		id: PAGE_ID,
		name: "Page",
		url,
		parent_id: null,
		is_group: false,
		last_update: new Date(),
	};
	return page;
}

it("returns urls if they conflict", async () => {
	const urls = ["/page", "/page2", "/page3"];

	prisma.page.findFirst
		.mockResolvedValueOnce(getPage(urls[0]!))
		.mockResolvedValueOnce(getPage(urls[1]!))
		.mockResolvedValueOnce(getPage(urls[2]!));

	await expect(
		caller.pages.checkConflict({
			newParentId: PAGE_ID,
			originalUrls: urls,
		}),
	).resolves.toEqual({
		conflict: true,
		urls,
	} satisfies Awaited<ReturnType<typeof caller.pages.checkConflict>>);

	prisma.page.findFirst
		.mockResolvedValueOnce(getPage(urls[0]!))
		.mockResolvedValueOnce(getPage(urls[1]!));

	await expect(
		caller.pages.checkConflict({
			newParentId: PAGE_ID,
			originalUrls: urls,
		}),
	).resolves.toEqual({
		conflict: true,
		urls: urls.slice(0, 2),
	} satisfies Awaited<ReturnType<typeof caller.pages.checkConflict>>);
});

it("returns false if there are no conflicts", async () => {
	prisma.page.findFirst.mockResolvedValueOnce(null);

	await expect(
		caller.pages.checkConflict({
			newParentId: PAGE_ID,
			originalUrls: ["/page"],
		}),
	).resolves.toEqual({
		conflict: false,
	} satisfies Awaited<ReturnType<typeof caller.pages.checkConflict>>);
});
