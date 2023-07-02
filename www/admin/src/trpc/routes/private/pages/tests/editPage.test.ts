import { expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";
import { prisma } from "@admin/prisma/__mocks__/client";
import { caller } from "@admin/src/trpc/routes/private/_private";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

vi.mock("@admin/prisma/client");

const ID = "clgaxfcla0017qnotc4a9aemf";
const NEW_NAME = "New Name";
const NEW_SLUG = "new-name";

it("updates the page's url and its children's urls", async () => {
	prisma.page.findFirst.mockResolvedValueOnce({
		id: ID,
		name: "Old Name",
		url: "/old-name",
		parent_id: null,
		is_group: false,
		last_update: new Date(),
	});

	expect(
		await caller.pages.editPage({
			id: ID,
			newName: NEW_NAME,
			newUrl: "/" + NEW_SLUG,
		})
	).toBeUndefined();

	const updatePageCall = prisma.page.update.mock.calls[0];
	expect(updatePageCall).toBeDefined();

	const updatePageArgs = updatePageCall![0];
	expect(updatePageArgs).toEqual({
		where: { id: ID },
		data: {
			name: NEW_NAME,
			url: "/" + NEW_SLUG,
			last_update: expect.any(Date),
		},
	});

	const updateChildrenCall = prisma.$executeRaw.mock.calls[0];
	expect(updateChildrenCall).toBeDefined();
	expect(updateChildrenCall).toMatchSnapshot();
});

it("throws a trpc 404 'NOT_FOUND' error if the page doesn't exist", async () => {
	prisma.page.findFirst.mockResolvedValueOnce(null);

	await expect(
		caller.pages.editPage({
			id: ID,
			newName: NEW_NAME,
			newUrl: "/" + NEW_SLUG,
		})
	).rejects.toThrowError("NOT_FOUND" as TRPC_ERROR_CODE_KEY);
});

it("throws a trpc 409 'CONFLICT' error if the new url is already taken", async () => {
	prisma.page.findFirst.mockResolvedValueOnce({
		id: ID,
		name: NEW_NAME,
		url: "/" + NEW_SLUG,
		parent_id: null,
		is_group: false,
		last_update: new Date(),
	});

	prisma.$transaction.mockRejectedValue(
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

	await expect(
		caller.pages.editPage({
			id: ID,
			newName: NEW_NAME,
			newUrl: "/" + NEW_SLUG,
		})
	).rejects.toThrowError("CONFLICT" as TRPC_ERROR_CODE_KEY);
});

it("throws a trpc 500 'INTERNAL_SERVER_ERROR' error if the database throws an unknown error", async () => {
	prisma.page.findFirst.mockResolvedValueOnce({
		id: ID,
		name: NEW_NAME,
		url: "/" + NEW_SLUG,
		parent_id: null,
		is_group: false,
		last_update: new Date(),
	});

	prisma.$transaction.mockRejectedValueOnce(new Error("Unknown error"));

	await expect(
		caller.pages.editPage({
			id: ID,
			newName: NEW_NAME,
			newUrl: "/" + NEW_SLUG,
		})
	).rejects.toThrowError("INTERNAL_SERVER_ERROR" as TRPC_ERROR_CODE_KEY);
});
