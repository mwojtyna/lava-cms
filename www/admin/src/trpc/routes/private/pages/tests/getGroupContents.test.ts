import { prisma } from "@admin/prisma/__mocks__/client";
import type { Page } from "@prisma/client";
import { expect, it, vi } from "vitest";
import { caller } from "@admin/src/trpc/routes/private/_private";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

vi.mock("@admin/prisma/client");

it("returns root group contents if input isn't provided", async () => {
	prisma.page.findFirst.mockResolvedValueOnce({
		id: "root-group-id",
		name: "Root Group",
		url: "/root-group",
		parent_id: null,
		is_group: true,
		last_update: new Date(),
	});

	const ROOT_GROUP_CONTENTS: Page[] = [
		{
			id: "page-id",
			name: "Page",
			url: "/page",
			parent_id: "root-group-id",
			is_group: false,
			last_update: new Date(),
		},
	];
	prisma.page.findMany.mockResolvedValueOnce(ROOT_GROUP_CONTENTS);

	await expect(caller.pages.getGroupContents()).resolves.toMatchObject({
		breadcrumbs: [],
		pages: ROOT_GROUP_CONTENTS,
	} satisfies Awaited<ReturnType<typeof caller.pages.getGroupContents>>);
	expect(prisma.page.findFirst).toHaveBeenNthCalledWith(1, { where: { parent_id: null } });
});

it("returns group contents if input is provided", async () => {
	const GROUP_CONTENTS: Page[] = [
		{
			id: "page-id",
			name: "Page 1",
			url: "/page-1",
			parent_id: "group-id",
			is_group: false,
			last_update: new Date(),
		},
		{
			id: "page-id",
			name: "Page 2",
			url: "/page-2",
			parent_id: "group-id",
			is_group: false,
			last_update: new Date(),
		},
	];

	const PARENT_GROUP_1: Page = {
		id: "parent-group-1-id",
		name: "Parent Group 1",
		url: "/parent-group-1",
		parent_id: "root-group-id",
		is_group: true,
		last_update: new Date(),
	};
	const PARENT_GROUP_2: Page = {
		id: "parent-group-2-id",
		name: "Parent Group 2",
		url: "/parent-group-1/parent-group-2",
		parent_id: PARENT_GROUP_1.id,
		is_group: true,
		last_update: new Date(),
	};
	const GROUP: Page & { children: Page[] } = {
		id: "group-id",
		name: "Group",
		url: "/parent-group-1/parent-group-2/group",
		parent_id: PARENT_GROUP_2.id,
		is_group: true,
		last_update: new Date(),
		children: GROUP_CONTENTS,
	};

	prisma.page.findFirst.mockResolvedValueOnce(GROUP);
	prisma.page.findUnique
		.mockResolvedValueOnce(PARENT_GROUP_2)
		.mockResolvedValueOnce(PARENT_GROUP_1);

	await expect(caller.pages.getGroupContents({ id: "group-id" })).resolves.toMatchObject({
		breadcrumbs: [PARENT_GROUP_1, PARENT_GROUP_2, GROUP],
		pages: GROUP_CONTENTS,
	} satisfies Awaited<ReturnType<typeof caller.pages.getGroupContents>>);

	expect(prisma.page.findFirst).toHaveBeenNthCalledWith(1, {
		where: { id: "group-id", is_group: true },
		include: { children: true },
	});
	expect(prisma.page.findUnique).toHaveBeenNthCalledWith(1, {
		where: { id: "parent-group-2-id" },
	});
	expect(prisma.page.findUnique).toHaveBeenNthCalledWith(2, {
		where: { id: "parent-group-1-id" },
	});
});

it("throws a trpc 404 'NOT_FOUND' error if group doesn't exist", async () => {
	prisma.page.findFirst.mockResolvedValueOnce(null);

	await expect(caller.pages.getGroupContents({ id: "group-id" })).rejects.toThrowError(
		"NOT_FOUND" satisfies TRPC_ERROR_CODE_KEY,
	);
});
