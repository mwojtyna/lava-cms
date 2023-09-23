import { generateRandomString } from "lucia/utils";
import { privateProcedure } from "@admin/src/trpc";
import { prisma } from "@admin/prisma/client";

export const generateToken = privateProcedure.mutation(async () => {
	const token = generateRandomString(
		32,
		"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
	);
	const storedToken = await prisma.token.findFirst();

	await prisma.token.upsert({
		where: {
			id: storedToken?.id ?? "",
		},
		create: {
			token,
		},
		update: {
			token,
		},
	});
});
