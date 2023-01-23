import { describe, it, expect, vi } from "vitest";
import { caller } from "../_router";
import { prisma } from "@api/prisma/__mocks__/client";

vi.mock("@api/prisma/client");

describe("firstTime", () => {
	it("returns true if no users exist", async () => {
		prisma.users.findFirst.mockResolvedValue(null);

		const result = await caller.firstTime();

		expect(result).toBe(true);
	});

	it("returns false if users exist", async () => {
		prisma.users.findFirst.mockResolvedValue({
			id: "123456789abcdef",
			name: "John",
			last_name: "Doe",
			email: "johndoe@domain.com",
			password: "password",
		});

		const result = await caller.firstTime();

		expect(result).toBe(false);
	});
});
