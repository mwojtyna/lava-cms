import { it, expect, vi } from "vitest";
import { caller } from "@api/trpc/routes/_app";
import { prisma } from "@api/prisma/__mocks__/client";

const mockUser = {
	id: "123456789abcdef",
	name: "John",
	last_name: "Doe",
	email: "johndoe@domain.com",
	password: "password",
};

vi.mock("@api/prisma/client");

it("returns true and correct reason if no users exist", async () => {
	prisma.user.findFirst.mockResolvedValue(null);
	prisma.config.findFirst.mockResolvedValue(null);

	const { reason } = await caller.auth.setupRequired();
	expect(reason).toBe("no-user");
});
it("returns true and correct reason if config is not applied", async () => {
	prisma.user.findFirst.mockResolvedValue(mockUser);
	prisma.config.findFirst.mockResolvedValue(null);

	const { reason } = await caller.auth.setupRequired();
	expect(reason).toBe("no-config");
});

it("returns false and no reason if users and config exist", async () => {
	prisma.user.findFirst.mockResolvedValue(mockUser);
	prisma.config.findFirst.mockResolvedValue({
		id: "123456789abcdef",
		title: "My Blog",
		description: "My blog description",
		language: "en",
	});

	const { reason } = await caller.auth.setupRequired();
	expect(reason).toBeNull();
});
