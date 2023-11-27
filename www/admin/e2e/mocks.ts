import { prisma } from "@admin/prisma/client";
import type { AdminUser, SettingsConnection, SettingsSeo } from "@prisma/client";

export const userMock: AdminUser = {
	id: "pvelcizx9an5cufryuh85wd0",
	name: "John",
	last_name: "Doe",
	email: "johndoe@domain.com",
};
export const userPasswordDecrypted = "Zaq1@wsx";

export const seoSettingsMock: Omit<SettingsSeo, "id"> = {
	title: "My website",
	description: "My website description",
	language: "en",
};
export const connectionSettingsMock: Omit<SettingsConnection, "id"> = {
	token: "Rdt9DZz45guRCk6d9S8dASl9pSIXeqyh",
	development_url: "http://localhost:3000",
};

export async function createMockUser() {
	await prisma.$transaction([
		prisma.adminUser.create({
			data: userMock,
		}),
		prisma.adminKey.create({
			data: {
				id: `email:${userMock.email}`,
				hashed_password: "$2b$10$ZVGT1G/c.WqZHa9UpSBTEeDRuL6sd/.k.RgPGE0YaZuPDdaV3Oe1G",
				user_id: userMock.id,
			},
		}),
	]);

	return userMock;
}
export async function deleteMockUser() {
	await prisma.$transaction([
		prisma.adminUser.deleteMany(),
		prisma.adminSession.deleteMany(),
		prisma.adminKey.deleteMany(),
	]);
}
