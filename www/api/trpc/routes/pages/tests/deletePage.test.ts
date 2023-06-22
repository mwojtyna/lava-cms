import { expect, it, vi } from "vitest";
import { prisma } from "@api/prisma/__mocks__/client";
import { caller } from "@api/trpc/routes/_app";

vi.mock("@api/prisma/client");

const ID = "clgaxfcla0017qnotc4a9aemf";

it("deletes a page", async () => {
	await expect(
		caller.pages.deletePage({
			id: ID,
		})
	).resolves.toBeUndefined();

	const deleteCall = prisma.page.delete.mock.calls[0];
	expect(deleteCall).toBeDefined();

	expect(prisma.page.delete).toHaveBeenCalledOnce();
	expect(deleteCall![0]).toMatchObject({
		where: {
			id: ID,
		},
	});
});
