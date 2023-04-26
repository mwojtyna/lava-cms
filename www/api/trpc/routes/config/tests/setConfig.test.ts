import { expect, it, vi } from "vitest";
import { prisma } from "@api/prisma/__mocks__/client";
import { caller } from "@api/trpc/routes/_app";

vi.mock("@api/prisma/client");

const TITLE = "Title";
const DESCRIPTION = "Description";
const LANGUAGE = "en";

it("creates a config row if it doesn't exist", async () => {
	prisma.config.findFirst.mockResolvedValue(null);

	await caller.config.setConfig({
		title: TITLE,
		description: DESCRIPTION,
		language: LANGUAGE,
	});

	const call = prisma.config.create.mock.calls[0];
	expect(call).toBeDefined();

	expect(prisma.config.create).toHaveBeenCalledOnce();
	expect(call![0].data).toMatchObject({
		title: TITLE,
		description: DESCRIPTION,
		language: LANGUAGE,
	});
});

it("updates a config row if it exists", async () => {
	prisma.config.findFirst.mockResolvedValue({
		id: "1",
		title: TITLE,
		description: DESCRIPTION,
		language: LANGUAGE,
	});

	await caller.config.setConfig({
		title: TITLE,
		description: DESCRIPTION,
		language: LANGUAGE,
	});

	const call = prisma.config.update.mock.calls[0];
	expect(call).toBeDefined();

	expect(prisma.config.update).toHaveBeenCalledOnce();
	expect(call![0].data).toMatchObject({
		title: TITLE,
		description: DESCRIPTION,
		language: LANGUAGE,
	});
});
