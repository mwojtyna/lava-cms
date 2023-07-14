import { expect, it, vi } from "vitest";
import { prisma } from "@admin/prisma/__mocks__/client";
import { publicCaller } from "@admin/src/trpc/routes/public/_public";
import type { Page } from "@prisma/client";

vi.mock("@admin/prisma/client");

const PAGE: Page = {
	id: "0",
	name: "Test",
	url: "/test",
	parent_id: null,
	is_group: false,
	last_update: new Date(),
};

it("should return a page if first pass returns it", async () => {
	prisma.page.findFirst.mockResolvedValueOnce(PAGE);

	const page = await publicCaller.getPage({ path: PAGE.url });
	expect(page).toEqual(PAGE);
});

it("should return a page if second pass returns it", async () => {
	prisma.page.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(PAGE);

	const page = await publicCaller.getPage({ path: PAGE.url + "/" });
	expect(page).toEqual(PAGE);
});

it("should return null if no page is found", async () => {
	prisma.page.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

	const page = await publicCaller.getPage({ path: PAGE.url });
	expect(page).toEqual(null);
});
