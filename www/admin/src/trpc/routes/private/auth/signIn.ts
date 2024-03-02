import { TRPCError } from "@trpc/server";
import * as argon2 from "argon2";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/prisma/client";
import { auth } from "@/src/auth";
import { privateProcedure } from "@/src/trpc";

const EMPTY_PASSWORD_HASHED =
	"$argon2i$v=19$m=19456,t=2,p=1$vq+PjhCuFdb2QP7duk9Ftg$vPm1zQHyVacvlN1GVRlPnqd1N3sgABPEYo3eCR2D16k";

export const signIn = privateProcedure
	.meta({ noAuth: true })
	.input(
		z.object({
			email: z.string().email(),
			password: z.string(),
		}),
	)
	.mutation(async ({ input }) => {
		const existingUser = await prisma.adminUser.findUnique({ where: { email: input.email } });
		const hashed = existingUser?.password ?? EMPTY_PASSWORD_HASHED;
		const passwordMatches = await argon2.verify(hashed, input.password.normalize("NFKC"));
		if (!passwordMatches || !existingUser) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}

		const session = await auth.createSession(existingUser.id, {});
		const sessionCookie = auth.createSessionCookie(session.id);
		cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	});
