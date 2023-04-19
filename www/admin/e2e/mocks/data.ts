import type { User, Config } from "api/prisma/types";

export const userMock: User & { passwordEncrypted: string } = {
	id: "clfykj2350000nzjhb7hrvan4",
	name: "John",
	last_name: "Doe",
	email: "johndoe@domain.com",
	password: "password",
	passwordEncrypted: "$2a$10$.Ckfh4eDN6ilAAkdMSVOC.4yY1fE3AujLWfpIPWXsB1fFBzwNtbqC",
};
export const websiteSettingsMock: Omit<Config, "id"> = {
	title: "My website",
	description: "My website description",
	language: "en",
};
