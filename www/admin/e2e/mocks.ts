import type { AdminUser, SettingsConnection, SettingsSeo } from "@prisma/client";
import { prisma } from "@/prisma/client";

export const DEFAULT_SESSION_COOKIE_NAME = "auth_session";

export const userMock: AdminUser = {
	id: "pvelcizx9an5cufryuh85wd0",
	name: "John",
	last_name: "Doe",
	email: "johndoe@domain.com",
	password: "$2a$12$fLCEgoS04gyh0wQeCdel9OEAHAu0WgDQUrTa/27vvgmYGKMF8Tk06",
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
	]);

	return userMock;
}
export async function deleteMockUser() {
	await prisma.$transaction([prisma.adminUser.deleteMany(), prisma.adminSession.deleteMany()]);
}
