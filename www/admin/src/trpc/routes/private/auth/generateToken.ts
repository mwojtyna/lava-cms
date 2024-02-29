import { alphabet, generateRandomString } from "oslo/crypto";
import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";

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
	return generateRandomString(32, alphabet("a-z", "A-Z", "0-9"));
}
