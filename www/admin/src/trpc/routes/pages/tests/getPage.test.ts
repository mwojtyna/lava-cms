import { expect, it, vi } from "vitest";
import { prisma } from "@admin/src/prisma/__mocks__/client";
import { caller } from "@admin/src/trpc/routes/_app";
import type { Page } from "@admin/src/prisma/types";

vi.mock("@admin/src/prisma/client");

const PAGE: Page = {
	id: "0",
	name: "Test",
	url: "/test",
	parent_id: null,
	is_group: false,
	last_update: new Date(),
};

it("should return a page", async () => {
	prisma.page.findUnique.mockResolvedValueOnce(PAGE);

	const page = await caller.pages.getPage({ url: PAGE.url });
	expect(page).toEqual(PAGE);
});
