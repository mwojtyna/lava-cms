import { expect, it, vi } from "vitest";
import { prisma } from "@api/prisma/__mocks__/client";
import { caller } from "@api/trpc/routes/_app";
import type { Page } from "@api/prisma/types";

vi.mock("@api/prisma/client");

const PAGE: Page = {
	id: "0",
	name: "Test",
	url: "/test",
	parent_id: null,
};

it("should return a page", async () => {
	prisma.page.findUnique.mockResolvedValueOnce(PAGE);

	const page = await caller.pages.getPage({ url: PAGE.url });
	expect(page).toEqual(PAGE);
});
