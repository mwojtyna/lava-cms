import { expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";
import { prisma } from "@api/prisma/__mocks__/client";
import { caller } from "@api/trpc/routes/_app";

vi.mock("@api/prisma/client");

it("adds a page", async () => {
	await caller.pages.addPage({
		name: "Page",
		url: "/page",
		parent_id: undefined,
		order: 1,
	});

	const call = prisma.page.create.mock.calls[0];
	expect(call).toBeDefined();

	expect(prisma.page.create).toHaveBeenCalled();
	expect(call![0].data).toMatchObject({
		name: "Page",
		url: "/page",
		parent_id: null,
		order: 1,
	});
});

it("throws a trpc 409 'CONFLICT' error if the page url already exists", async () => {
	prisma.page.create.mockRejectedValue(
		new Prisma.PrismaClientKnownRequestError("CONFLICT", {
			clientVersion: "mocked",
			code: "P2002",
			meta: {
				target: ["url"],
			},
		})
	);

	await expect(
		caller.pages.addPage({
			name: "Page",
			url: "/page",
			parent_id: undefined,
			order: 1,
		})
	).rejects.toThrowError("CONFLICT");
});
