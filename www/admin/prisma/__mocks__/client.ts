import { afterEach, beforeEach, vi } from "vitest";
import { mockDeep, mockClear } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";

export const prisma = mockDeep<PrismaClient>();

beforeEach(() => {
	// Bypass the privateAuth middleware
	prisma.config.count.mockResolvedValue(0);
	vi.mock("next/headers", () => ({
		cookies: vi.fn(() => ({
			get: vi.fn(),
		})),
	}));
	vi.mock("@admin/src/utils/server", () => ({
		url: vi.fn(() => "http://localhost:3001"),
	}));
});
afterEach(() => {
	mockClear(prisma);
	vi.clearAllMocks();
});
