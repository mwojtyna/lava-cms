import { expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";
import { prisma } from "@api/prisma/__mocks__/client";
import { caller } from "@api/trpc/routes/_app";

vi.mock("@api/prisma/client");

const PAGE: Omit<Prisma.PageCreateInput, "id"> = {
	name: "Page",
	url: "/page",
	order: 0,
};

it("adds a page", async () => {
	await caller.pages.addPage(PAGE);

	const call = prisma.page.create.mock.calls[0];
	expect(call).toBeDefined();

	expect(prisma.page.create).toHaveBeenCalled();
	expect(call![0].data).toMatchObject(PAGE);
});

it("throws a trpc 409 'CONFLICT' error if the page url already exists", async () => {
	prisma.page.create.mockRejectedValue(
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
	prisma.page.create.mockRejectedValue(
		new Prisma.PrismaClientUnknownRequestError("unknown", { clientVersion: "mocked" })
	);

	await expect(caller.pages.addPage(PAGE)).rejects.toThrowError(
		"INTERNAL_SERVER_ERROR" satisfies TRPC_ERROR_CODE_KEY
	);
});
