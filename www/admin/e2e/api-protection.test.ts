import { expect } from "@playwright/test";
import { test } from "./fixtures";
import { tokenMock, websiteSettingsMock } from "./mocks";
import { prisma } from "@admin/prisma/client";
import { DEFAULT_SESSION_COOKIE_NAME } from "lucia";

test.beforeAll(async () => {
	await prisma.config.create({
		data: {
			...websiteSettingsMock,
		},
	});
});
test.afterAll(async () => {
	await prisma.config.deleteMany();
});

test.describe("private API", () => {
	test("returns 401 if no or invalid cookie is provided", async ({ request }) => {
		const res = await request.get("/admin/api/private/config.getConfig", {
			headers: {
				Cookie: `${DEFAULT_SESSION_COOKIE_NAME}=invalid`,
			},
		});
		expect(res.status()).toBe(401);
	});

	test("returns 200 if valid cookie is provided", async ({ authedRequest: request }) => {
		const res = await request.get("/admin/api/private/config.getConfig");
		expect(res.status()).toBe(200);
	});
});

test.describe("public API", () => {
	test("returns 401 if no or invalid token provided", async ({ request }) => {
		const res = await request.get("/admin/api/public/getConfig");
		expect(res.status()).toBe(401);

		const res2 = await request.get("/admin/api/public/getConfig", {
			headers: {
				Authorization: "Bearer token",
			},
		});
		expect(res2.status()).toBe(401);
	});

	test("returns 200 if valid token is provided", async ({ authedRequest: request }) => {
		const res = await request.get("/admin/api/public/getConfig", {
			headers: { Authorization: `Bearer ${tokenMock}` },
		});
		expect(res.status()).toBe(200);
	});
});
