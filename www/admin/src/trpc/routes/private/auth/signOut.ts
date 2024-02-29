import { TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import { auth, validateRequest } from "@/src/auth";
import { privateProcedure } from "@/src/trpc";

export const signOut = privateProcedure.mutation(async () => {
	const { session } = await validateRequest();
	if (!session) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	await auth.invalidateSession(session.id);
	const sessionCookie = auth.createBlankSessionCookie();
	cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
});
