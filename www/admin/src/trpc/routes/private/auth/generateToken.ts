import { generateRandomString } from "lucia/utils";
import { privateProcedure } from "@admin/src/trpc";
import { prisma } from "@admin/prisma/client";

export const generateToken = privateProcedure.mutation(async () => {
	const token = randomString();
	const storedToken = await prisma.settingsConnection.findFirst();

	await prisma.settingsConnection.update({
		where: {
			id: storedToken?.id ?? "",
		},
		data: {
			token,
		},
	});
});

export function randomString() {
	return generateRandomString(
		32,
		"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
	);
}
