import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Lucia, type Session, type User } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "@/prisma/client";
import { env } from "@/src/env/server.mjs";
import "server-only";

const prismaAdapter = new PrismaAdapter(prisma.adminSession, prisma.adminUser);

export const auth = new Lucia(prismaAdapter, {
	getUserAttributes: (databaseUserAttributes) => ({
		email: databaseUserAttributes.email,
		name: databaseUserAttributes.name,
		lastName: databaseUserAttributes.last_name,
	}),
	sessionCookie: {
		expires: false,
		attributes: {
			path: "/admin",
			sameSite: "lax",
			secure: env.NODE_ENV === "production",
		},
	},
});

export const validateRequest = cache(
	async (): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
		const sessionId = cookies().get(auth.sessionCookieName)?.value ?? null;
		if (!sessionId) {
			return {
				user: null,
				session: null,
			};
		}

		const result = await auth.validateSession(sessionId);
		try {
			if (result.session?.fresh) {
				const sessionCookie = auth.createSessionCookie(result.session.id);
				cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
			}
			if (!result.session) {
				const sessionCookie = auth.createBlankSessionCookie();
				cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
			}
		} catch {
			// next.js throws when you attempt to set cookie when rendering page
		}

		return result;
	},
);

export type Auth = typeof auth;
