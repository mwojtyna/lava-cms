import { expect, it, vi } from "vitest";
import { prisma } from "@api/prisma/__mocks__/client";
import bcrypt from "bcrypt";
import { caller } from "@api/trpc/routes/_app";

vi.mock("@api/prisma/client");

const ID = "123456789abcdef";
const NAME = "John";
const LAST_NAME = "Doe";
const EMAIL = "johndoe@domain.com";
const PASSWORD = "password";

it.concurrent("returns user's id if email and password are correct", async () => {
	prisma.users.findFirst.mockResolvedValue({
		id: ID,
		name: NAME,
		last_name: LAST_NAME,
		email: EMAIL,
		password: await bcrypt.hash(PASSWORD, 10),
	});
	const userId = await caller.auth.signIn({ email: EMAIL, password: PASSWORD });

	expect(userId).toBe(ID);
});

it.concurrent("throws an error if email is incorrect", async () => {
	prisma.users.findFirst.mockResolvedValue(null);

	await expect(caller.auth.signIn({ email: EMAIL, password: PASSWORD })).rejects.toThrow("email");
});

it.concurrent("throws an error if password is incorrect", async () => {
	prisma.users.findFirst.mockResolvedValue({
		id: ID,
		name: NAME,
		last_name: LAST_NAME,
		email: EMAIL,
		password: await bcrypt.hash(PASSWORD, 10),
	});

	await expect(caller.auth.signIn({ email: EMAIL, password: "wrong password" })).rejects.toThrow(
		"password"
	);
});
