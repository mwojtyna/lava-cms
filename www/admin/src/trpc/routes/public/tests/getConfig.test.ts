import { expect, it, vi } from "vitest";
import { prisma } from "@admin/prisma/__mocks__/client";
import { publicCaller } from "@admin/src/trpc/routes/public/_public";

vi.mock("@admin/prisma/client");

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

	const config = await publicCaller.getConfig();

	expect(config).toMatchObject({
		title: TITLE,
		description: DESCRIPTION,
		language: LANGUAGE,
	});
});
