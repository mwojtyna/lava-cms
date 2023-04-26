import { expect, it, vi } from "vitest";
import { prisma } from "@api/prisma/__mocks__/client";
import { caller } from "@api/trpc/routes/_app";
import type { Page } from "@api/prisma/types";

vi.mock("@api/prisma/client");

const PAGES: Page[] = [
	{
		id: "0",
		name: "Test",
		url: "/test",
		order: 0,
		parent_id: null,
	},
	{
		id: "1",
		name: "Home",
		url: "/home",
		order: 1,
		parent_id: null,
	},
	{
		id: "2",
		name: "Nested",
		url: "/home/nested",
		order: 2,
		parent_id: "1",
	},
];

it("should return pages", async () => {
	prisma.page.findMany.mockResolvedValue(PAGES);

	const pages = await caller.pages.getPages();
	expect(pages).toEqual(PAGES);
});
