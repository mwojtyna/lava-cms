import { it, expect, vi } from "vitest";
import { caller } from "@api/trpc/routes/_app";
import { prisma } from "@api/prisma/__mocks__/client";

vi.mock("@api/prisma/client");

it("returns true if no users exist", async () => {
	prisma.user.findFirst.mockResolvedValue(null);
	prisma.config.findFirst.mockResolvedValue(null);

	const { firstTime } = await caller.auth.firstTime();

	expect(firstTime).toBe(true);
});

it("returns false if users exist", async () => {
	prisma.user.findFirst.mockResolvedValue({
		id: "123456789abcdef",
		name: "John",
		last_name: "Doe",
		email: "johndoe@domain.com",
		password: "password",
	});

	const { firstTime } = await caller.auth.firstTime();

	expect(firstTime).toBe(false);
});
