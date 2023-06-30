import { it, expect, vi } from "vitest";
import { privateCaller } from "@admin/src/trpc/routes/private/_private";
import { prisma } from "@admin/prisma/__mocks__/client";

const mockUser = {
	id: "123456789abcdef",
	name: "John",
	last_name: "Doe",
	email: "johndoe@domain.com",
	password: "password",
};

vi.mock("@admin/prisma/client");

it("returns true and correct reason if no users exist", async () => {
	prisma.authUser.findFirst.mockResolvedValue(null);
	prisma.config.findFirst.mockResolvedValue(null);

	const { reason } = await privateCaller.auth.setupRequired();
	expect(reason).toBe("no-user");
});
it("returns true and correct reason if config is not applied", async () => {
	prisma.authUser.findFirst.mockResolvedValue(mockUser);
	prisma.config.findFirst.mockResolvedValue(null);

	const { reason } = await privateCaller.auth.setupRequired();
	expect(reason).toBe("no-config");
});

it("returns false and no reason if users and config exist", async () => {
	prisma.authUser.findFirst.mockResolvedValue(mockUser);
	prisma.config.findFirst.mockResolvedValue({
		id: "123456789abcdef",
		title: "My Blog",
		description: "My blog description",
		language: "en",
	});

	const { reason } = await privateCaller.auth.setupRequired();
	expect(reason).toBeNull();
});
