import { expect, it, vi } from "vitest";
import { prisma } from "@api/prisma/__mocks__/client";
import { caller } from "@api/trpc/routes/_app";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

vi.mock("@api/prisma/client");

const ID = "clgaxfcla0017qnotc4a9aemf";
const NEW_PARENT_ID = "clgaxfcla0017qnotc4a9aemg";
const NEW_SLUG = "new-name";

it("updates the page's url, parent_id, and its children's urls, shifts original parent's children's order up", async () => {
	prisma.$transaction.mockResolvedValueOnce([{}, {}]);

	await expect(
		caller.pages.movePage({
			id: ID,
			newParentId: NEW_PARENT_ID,
			slug: NEW_SLUG,
		})
	).resolves.toBeUndefined();

	const movePageCall = prisma.$transaction.mock.calls[1];
	expect(movePageCall).toBeDefined();
});

it("throws a trpc 404 'NOT_FOUND' error if parent page or page doesn't exist", async () => {
	prisma.$transaction.mockResolvedValueOnce([null, null]);
	await expect(
		caller.pages.movePage({
			id: ID,
			newParentId: NEW_PARENT_ID,
			slug: NEW_SLUG,
		})
	).rejects.toThrowError("NOT_FOUND" as TRPC_ERROR_CODE_KEY);

	prisma.$transaction.mockResolvedValueOnce([null, {}]);
	await expect(
		caller.pages.movePage({
			id: ID,
			newParentId: NEW_PARENT_ID,
			slug: NEW_SLUG,
		})
	).rejects.toThrowError("NOT_FOUND" as TRPC_ERROR_CODE_KEY);

	prisma.$transaction.mockResolvedValueOnce([{}, null]);
	await expect(
		caller.pages.movePage({
			id: ID,
			newParentId: NEW_PARENT_ID,
			slug: NEW_SLUG,
		})
	).rejects.toThrowError("NOT_FOUND" as TRPC_ERROR_CODE_KEY);

	prisma.$transaction.mockResolvedValueOnce([{}, {}]);
	await expect(
		caller.pages.movePage({
			id: ID,
			newParentId: NEW_PARENT_ID,
			slug: NEW_SLUG,
		})
	).resolves.toBeUndefined();
});
