import { vi, it, expect } from "vitest";
import { prisma } from "@admin/prisma/__mocks__/client";
import { publicCaller } from "../_public";

vi.mock("@admin/prisma/client");

it("returns all paths for a group, but only the last part of the path", async () => {
	prisma.page.findFirst.mockResolvedValueOnce({
		id: "1",
		parent_id: "root_id",
		is_group: true,
		url: "/test",
		last_update: new Date(),
		name: "Test",
		// @ts-expect-error 'children' property exists because of 'include: {children: true}'
		children: [
			{
				url: "/test/test-1",
			},
			{
				url: "/test/test-2",
			},
			{
				url: "/test/test-3",
			},
		],
	});

	const res = await publicCaller.getPaths({ groupUrl: "/test" });
	expect(res).toEqual(["test-1", "test-2", "test-3"]);
});
