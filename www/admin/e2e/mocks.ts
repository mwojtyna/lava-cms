import { prisma } from "@admin/prisma/client";
import type { User, Config } from "@admin/prisma/types";

export const userMock: User = {
	id: "pvelcizx9an5cufryuh85wd0",
	name: "John",
	last_name: "Doe",
	email: "johndoe@domain.com",
};
export const userPasswordDecrypted = "Zaq1@wsx";

export const websiteSettingsMock: Omit<Config, "id"> = {
	title: "My website",
	description: "My website description",
	language: "en",
};

export const tokenMock = "Rdt9DZz45guRCk6d9S8dASl9pSIXeqyh";

export async function createMockUser() {
	await prisma.$transaction([
		prisma.user.create({
			data: userMock,
		}),
		prisma.key.create({
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
		prisma.user.deleteMany(),
		prisma.session.deleteMany(),
		prisma.key.deleteMany(),
	]);
}
