import { expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";
import { prisma } from "@admin/prisma/__mocks__/client";
import { caller } from "@admin/src/trpc/routes/_app";

vi.mock("@admin/prisma/client");

const PAGE: Parameters<typeof caller.pages.addPage>[0] = {
	name: "Page",
	url: "/page",
	parent_id: "cju0q2q2h0000g0q2q2h00001",
	is_group: false,
};
const ID = "cju0q2q2h0000g0q2q2h00000";

it("adds a page and returns its id", async () => {
	prisma.page.create.mockResolvedValueOnce({ id: ID, last_update: new Date(), ...PAGE });
	await expect(caller.pages.addPage(PAGE)).resolves.toBe(ID);

	expect(prisma.page.findFirst).not.toHaveBeenCalled();
});

it("throws a trpc 409 'CONFLICT' error if the page url already exists", async () => {
	prisma.page.create.mockRejectedValueOnce(
		new Prisma.PrismaClientKnownRequestError(
			"Unique constraint failed on the fields: (`url`)",
			{
				clientVersion: "mocked",
				code: "P2002",
				meta: {
					target: ["url"],
				},
			}
		)
	);

	await expect(caller.pages.addPage(PAGE)).rejects.toThrowError(
		"CONFLICT" satisfies TRPC_ERROR_CODE_KEY
	);
});

it("throws a trpc 500 'INTERNAL_SERVER_ERROR' error if any other error occurs", async () => {
	prisma.page.create.mockRejectedValueOnce(new Error("Unknown error"));

	await expect(caller.pages.addPage(PAGE)).rejects.toThrowError(
		"INTERNAL_SERVER_ERROR" satisfies TRPC_ERROR_CODE_KEY
	);
});
