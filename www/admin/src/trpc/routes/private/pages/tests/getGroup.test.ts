import { prisma } from "@admin/prisma/__mocks__/client";
import { expect, it, vi } from "vitest";
import { caller } from "../../_private";

vi.mock("@admin/prisma/client");

const GROUP = {
	id: "cju0q2q2h0000g0q2q2h00000",
	name: "Group",
	url: "/group",
	parent_id: null,
	is_group: true,
	last_update: new Date(),
};

it("returns root group if input isn't provided", async () => {
	prisma.page.findFirst.mockResolvedValueOnce(GROUP);
	await expect(caller.pages.getGroup()).resolves.toMatchObject(GROUP);

	expect(prisma.page.findFirst).toHaveBeenNthCalledWith(1, {
		where: { parent_id: null },
	});
});

it("returns group with provided it if input is provided", async () => {
	prisma.page.findFirst.mockResolvedValueOnce(GROUP);
	await expect(caller.pages.getGroup({ id: GROUP.id })).resolves.toMatchObject(GROUP);

	expect(prisma.page.findFirst).toHaveBeenNthCalledWith(1, {
		where: { id: GROUP.id, is_group: true },
	});
});
