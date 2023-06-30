import { expect, it, vi } from "vitest";
import { prisma } from "@admin/prisma/__mocks__/client";
import { privateCaller } from "@admin/src/trpc/routes/private/_private";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";
import type { Page } from "@admin/prisma/types";

vi.mock("@admin/prisma/client");

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
		privateCaller.pages.movePage({
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
		privateCaller.pages.movePage({
			id: PAGE.id,
			newParentId: PARENT_GROUP.id,
		})
	).rejects.toThrowError("NOT_FOUND" as TRPC_ERROR_CODE_KEY);

	prisma.$transaction.mockResolvedValueOnce([null, PARENT_GROUP]);
	await expect(
		privateCaller.pages.movePage({
			id: PAGE.id,
			newParentId: PARENT_GROUP.id,
		})
	).rejects.toThrowError("NOT_FOUND" as TRPC_ERROR_CODE_KEY);

	prisma.$transaction.mockResolvedValueOnce([PAGE, null]);
	await expect(
		privateCaller.pages.movePage({
			id: PAGE.id,
			newParentId: PARENT_GROUP.id,
		})
	).rejects.toThrowError("NOT_FOUND" as TRPC_ERROR_CODE_KEY);

	prisma.$transaction.mockResolvedValueOnce([PAGE, PARENT_GROUP]);
	prisma.page.findFirst.mockResolvedValueOnce(PAGE);
	await expect(
		privateCaller.pages.movePage({
			id: PAGE.id,
			newParentId: PARENT_GROUP.id,
		})
	).resolves.toBeUndefined();
});
