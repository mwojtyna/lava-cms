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

export async function createMockUser() {
	await prisma.$transaction([
		prisma.authUser.create({
			data: {
				...userMock,
			},
		}),
		prisma.authKey.create({
			data: {
				id: `email:${userMock.email}`,
				hashed_password: "$2b$10$ZVGT1G/c.WqZHa9UpSBTEeDRuL6sd/.k.RgPGE0YaZuPDdaV3Oe1G",
				user_id: userMock.id,
				primary_key: true,
			},
		}),
	]);

	return userMock;
}
export async function deleteMockUser() {
	await prisma.$transaction([
		prisma.authUser.deleteMany(),
		prisma.authSession.deleteMany(),
		prisma.authKey.deleteMany(),
	]);
}
