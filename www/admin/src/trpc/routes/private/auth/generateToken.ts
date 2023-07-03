import { generateRandomString } from "lucia/utils";
import bcrypt from "bcrypt";
import { privateProcedure } from "@admin/src/trpc";
import { prisma } from "@admin/prisma/client";

export const generateToken = privateProcedure.mutation(async (): Promise<{ token: string }> => {
	const token = generateRandomString(32);
	const hashed = await bcrypt.hash(token, 10);
	const storedToken = await prisma.token.findFirst();

	await prisma.token.upsert({
		where: {
			id: storedToken?.id ?? "",
		},
		create: {
			token: hashed,
		},
		update: {
			token: hashed,
		},
	});

	return { token };
});
