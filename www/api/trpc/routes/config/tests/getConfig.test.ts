import { expect, it, vi } from "vitest";
import { prisma } from "@api/prisma/__mocks__/client";
import { caller } from "@api/trpc/routes/_app";

vi.mock("@api/prisma/client");

const TITLE = "Title";
const DESCRIPTION = "Description";
const LANGUAGE = "en";

it("gets the config without id", async () => {
	prisma.config.findFirstOrThrow.mockResolvedValue({
		id: "1",
		title: TITLE,
		description: DESCRIPTION,
		language: LANGUAGE,
	});

	const config = await caller.config.getConfig();

	expect(config).toMatchObject({
		title: TITLE,
		description: DESCRIPTION,
		language: LANGUAGE,
	});
});
