import type { User, Config } from "api/prisma/types";

export const userMock: User = {
	id: "clfykj2350000nzjhb7hrvan4",
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
