import { expect, it, vi } from "vitest";
import { prisma } from "@admin/prisma/__mocks__/client";
import { caller } from "@admin/src/trpc/routes/_app";

vi.mock("@admin/prisma/client");

const ID = "123456789abcdef";
const NAME = "John";
const LAST_NAME = "Doe";
const EMAIL = "johndoe@domain.com";
const PASSWORD = "password";
const HASHED_PASSWORD = "$2a$10$.Ckfh4eDN6ilAAkdMSVOC.4yY1fE3AujLWfpIPWXsB1fFBzwNtbqC";

it("returns user's id if email and password are correct", async () => {
	prisma.user.findFirst.mockResolvedValue({
		id: ID,
		name: NAME,
		last_name: LAST_NAME,
		email: EMAIL,
		password: HASHED_PASSWORD,
	});
	const { userId } = (await caller.auth.signIn({ email: EMAIL, password: PASSWORD })) ?? {};

	expect(userId).toBe(ID);
});

it("returns null if email is incorrect", async () => {
	prisma.user.findFirst.mockResolvedValue(null);

	expect(await caller.auth.signIn({ email: "wrong@email.com", password: PASSWORD })).toBeNull();
});

it("returns null if password is incorrect", async () => {
	prisma.user.findFirst.mockResolvedValue({
		id: ID,
		name: NAME,
		last_name: LAST_NAME,
		email: EMAIL,
		password: HASHED_PASSWORD,
	});

	expect(await caller.auth.signIn({ email: EMAIL, password: "wrong-password" })).toBeNull();
});
