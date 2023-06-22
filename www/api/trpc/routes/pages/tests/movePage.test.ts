import { expect, it, vi } from "vitest";
import { prisma } from "@api/prisma/__mocks__/client";
import { caller } from "@api/trpc/routes/_app";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";
import type { Page } from "@api/prisma/types";

vi.mock("@api/prisma/client");

const PAGE: Page = {
	id: "clgaxfcla0017qnotc4a9aemf",
	name: "Page",
	url: "/page",
	is_group: false,
	last_update: new Date(),
	parent_id: null,
};
const PARENT_GROUP: Page = {
	id: "clgaxfcla0017qnotc4a9aemf",
	name: "Parent group",
	url: "/parent-group",
	is_group: true,
	last_update: new Date(),
	parent_id: null,
};

it("updates the page's url, parent_id, and its children's urls", async () => {
	prisma.$transaction.mockResolvedValueOnce([PAGE, PARENT_GROUP]);
	prisma.page.findFirst.mockResolvedValueOnce(PAGE);

	await expect(
		caller.pages.movePage({
			id: PAGE.id,
			newParentId: PARENT_GROUP.id,
		})
	).resolves.toBeUndefined();

	expect(prisma.page.update).toHaveBeenCalledWith({
		where: { id: PAGE.id },
		data: {
			parent_id: PARENT_GROUP.id,
		},
	});
});

it("throws a trpc 404 'NOT_FOUND' error if parent page or page doesn't exist", async () => {
	prisma.$transaction.mockResolvedValueOnce([null, null]);
	await expect(
		caller.pages.movePage({
			id: PAGE.id,
			newParentId: PARENT_GROUP.id,
		})
	).rejects.toThrowError("NOT_FOUND" as TRPC_ERROR_CODE_KEY);

	prisma.$transaction.mockResolvedValueOnce([null, PARENT_GROUP]);
	await expect(
		caller.pages.movePage({
			id: PAGE.id,
			newParentId: PARENT_GROUP.id,
		})
	).rejects.toThrowError("NOT_FOUND" as TRPC_ERROR_CODE_KEY);

	prisma.$transaction.mockResolvedValueOnce([PAGE, null]);
	await expect(
		caller.pages.movePage({
			id: PAGE.id,
			newParentId: PARENT_GROUP.id,
		})
	).rejects.toThrowError("NOT_FOUND" as TRPC_ERROR_CODE_KEY);

	prisma.$transaction.mockResolvedValueOnce([PAGE, PARENT_GROUP]);
	prisma.page.findFirst.mockResolvedValueOnce(PAGE);
	await expect(
		caller.pages.movePage({
			id: PAGE.id,
			newParentId: PARENT_GROUP.id,
		})
	).resolves.toBeUndefined();
});
