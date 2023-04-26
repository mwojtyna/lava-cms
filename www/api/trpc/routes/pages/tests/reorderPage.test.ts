import { expect, it, vi } from "vitest";
import { prisma } from "@api/prisma/__mocks__/client";
import { caller } from "@api/trpc/routes/_app";
import type { reorderPage } from "../reorderPage";

vi.mock("@api/prisma/client");

const ARGS: typeof reorderPage._def._input_in = {
	activeId: "clgaxfcla0017qnotc4a9aemf",
	activeParentId: "clgaxfcla0017qnotc4a9aemg",
	overId: "clgaxfcla0017qnotc4a9aemh",
	order: 1,
	newOrder: 2,
};

it(
	"decrement order of items with order greater than the active item's order, change active item's order," +
		"and increment order of items with order greater than or equal to the new active item's order",
	async () => {
		await expect(caller.pages.reorderPage(ARGS)).resolves.toBeUndefined();

		const reorderPageCall = prisma.$transaction.mock.calls[0];
		expect(reorderPageCall).toBeDefined();

		const decrementOrderCall = prisma.page.updateMany.mock.calls[0];
		expect(decrementOrderCall).toBeDefined();

		const updatePageOrderCall = prisma.page.update.mock.calls[0];
		expect(updatePageOrderCall).toBeDefined();

		const incrementOrderCall = prisma.page.updateMany.mock.calls[1];
		expect(incrementOrderCall).toBeDefined();
	}
);
