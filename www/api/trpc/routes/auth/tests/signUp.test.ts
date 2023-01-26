import { describe, expect, it, vi } from "vitest";
import { prisma } from "@api/prisma/__mocks__/client";
import { caller } from "@api/trpc/routes/_app";

vi.mock("@api/prisma/client");

const NAME = "John";
const LAST_NAME = "Doe";
const EMAIL = "johndoe@domain.com";
const PASSWORD = "password";

it("creates a user", async () => {
	await caller.auth.signUp({
		name: NAME,
		lastName: LAST_NAME,
		email: EMAIL,
		password: PASSWORD,
	});

	expect(prisma.users.create).toHaveBeenCalled();
	expect(prisma.users.create.mock.calls[0][0].data).toMatchObject({
		name: NAME,
		last_name: LAST_NAME,
		email: EMAIL,
	});
});
