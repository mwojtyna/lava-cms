import { prisma } from "@admin/prisma/__mocks__/client";
import type { Page } from "@admin/prisma/types";
import { expect, it, vi } from "vitest";
import { caller } from "../../_private";

vi.mock("@admin/prisma/client");

function getPage(url: string) {
	const page: Page = {
		id: "cju0q2q2h0000g0q2q2h00000",
		name: "Page",
		url: "",
		parent_id: null,
		is_group: false,
		last_update: new Date(),
	};
	return { ...page, url };
}

it("returns urls if they conflict", async () => {
	const urls = ["/page", "/page2", "/page3"];

	prisma.page.findFirst
		.mockResolvedValueOnce(getPage(urls[0]!))
		.mockResolvedValueOnce(getPage(urls[1]!))
		.mockResolvedValueOnce(getPage(urls[2]!));
	await expect(
		caller.pages.checkConflict({
			newParentId: "cju0q2q2h0000g0q2q2h00000",
			originalUrls: urls,
		})
	).resolves.toEqual({
		conflict: true,
		urls,
	} satisfies Awaited<ReturnType<typeof caller.pages.checkConflict>>);

	prisma.page.findFirst
		.mockResolvedValueOnce(getPage(urls[0]!))
		.mockResolvedValueOnce(getPage(urls[1]!));
	await expect(
		caller.pages.checkConflict({
			newParentId: "cju0q2q2h0000g0q2q2h00000",
			originalUrls: urls,
		})
	).resolves.toEqual({
		conflict: true,
		urls: urls.slice(0, 2),
	} satisfies Awaited<ReturnType<typeof caller.pages.checkConflict>>);
});

it("returns false if there are no conflicts", async () => {
	prisma.page.findFirst.mockResolvedValueOnce(null);

	await expect(
		caller.pages.checkConflict({
			newParentId: "cju0q2q2h0000g0q2q2h00000",
			originalUrls: ["/page"],
		})
	).resolves.toEqual({
		conflict: false,
	} satisfies Awaited<ReturnType<typeof caller.pages.checkConflict>>);
});
