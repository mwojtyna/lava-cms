import { prisma } from "@admin/prisma/__mocks__/client";
import { expect, it, vi } from "vitest";
import { caller } from "../../_app";

vi.mock("@admin/prisma/client");

const GROUPS = [
	{
		id: "cju0q2q2h0000g0q2q2h00000",
		name: "Group 1",
		url: "/group-1",
		parent_id: null,
		is_group: true,
		last_update: new Date(),
	},
	{
		id: "cju0q2q2h0000g0q2q2h00001",
		name: "Group 2",
		url: "/group-2",
		parent_id: null,
		is_group: true,
		last_update: new Date(),
	},
];

it("returns all groups", async () => {
	prisma.page.findMany.mockResolvedValueOnce(GROUPS);
	await expect(caller.pages.getAllGroups()).resolves.toMatchObject(GROUPS);

	expect(prisma.page.findMany).toHaveBeenNthCalledWith(1, {
		where: { is_group: true },
	});
});
