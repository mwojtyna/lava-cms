import type { User, Config } from "api/prisma/types";

export const userMock: Omit<User, "id"> = {
	name: "John",
	last_name: "Doe",
	email: "johndoe@domain.com",
	password: "password",
};
export const websiteSettingsMock: Omit<Config, "id"> = {
	title: "My website",
	description: "My website description",
	language: "en",
};
