import { it, expect, vi } from "vitest";
import { caller } from "@api/trpc/routes/_app";
import { prisma } from "@api/prisma/__mocks__/client";

vi.mock("@api/prisma/client");

const ID = "clfa3cd3l0012qvjzym4lrha3";
const NAME = "John";
const LAST_NAME = "Doe";
const EMAIL = "johndoe@domain.com";
const PASSWORD = "password";

it("returns a user if one exists", async () => {
	prisma.user.findFirst.mockResolvedValue({
		id: ID,
		name: NAME,
		last_name: LAST_NAME,
		email: EMAIL,
		password: PASSWORD,
	});

	const { user } = await caller.auth.getUser({ id: ID });

	expect(user).toBeDefined();
});

it("returns null if user not found", async () => {
	prisma.user.findFirst.mockResolvedValue(null);

	const { user } = await caller.auth.getUser({ id: ID });

	expect(user).toBeNull();
});
