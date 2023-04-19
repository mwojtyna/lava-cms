import { expect, it, vi } from "vitest";
import { prisma } from "@api/prisma/__mocks__/client";
import { caller } from "@api/trpc/routes/_app";

vi.mock("@api/prisma/client");

const ID = "clgaxfcla0017qnotc4a9aemf";
const ORDER = 0;

it("deletes a page and decrements order of pages below", async () => {
	await caller.pages.deletePage({
		id: ID,
		parent_id: ID,
		order: ORDER,
	});

	const deleteCall = prisma.page.delete.mock.calls[0];
	expect(deleteCall).toBeDefined();

	expect(prisma.page.delete).toHaveBeenCalledOnce();
	expect(deleteCall![0]).toMatchObject({
		where: {
			id: ID,
		},
	});

	const updateOrderCall = prisma.page.updateMany.mock.calls[0];
	expect(updateOrderCall).toBeDefined();

	expect(prisma.page.updateMany).toHaveBeenCalledOnce();
	expect(updateOrderCall![0]).toMatchObject({
		where: {
			parent_id: ID,
			order: {
				gt: ORDER,
			},
		},
		data: {
			order: {
				decrement: 1,
			},
		},
	});
});
