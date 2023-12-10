import { prisma } from "@lucia-auth/adapter-prisma";
import bcrypt from "bcrypt";
import { lucia, type User } from "lucia";
import { nextjs_future } from "lucia/middleware";
import * as context from "next/headers";
import { prisma as prismaClient } from "@admin/prisma/client";
import { env } from "@admin/src/env/server.mjs";

export const auth = lucia({
	adapter: prisma(prismaClient, {
		user: "adminUser",
		session: "adminSession",
		key: "adminKey",
	}),
	env: env.NODE_ENV !== "production" ? "DEV" : "PROD", // DEV means http, PROD means https
	middleware: nextjs_future(),
	getUserAttributes: (user) => ({
		name: user.name,
		lastName: user.last_name,
		email: user.email,
	}),
	passwordHash: {
		generate: (password) => bcrypt.hash(password, 10),
		validate: (password, hash) => bcrypt.compare(password, hash),
	},
	// Session is active for 1 day
	// after that there is 2 weeks time when the user can re-activate the session
	// after that the session expires
	sessionCookie: {
		// Expires set to `false` means the cookie will expire in a year
		// otherwise the cookie itself will expire in 1 day, and won't extend
		// its expiration date when the session is re-activated
		expires: false,
		attributes: { sameSite: "strict", path: "/admin" },
	},
	csrfProtection: {
		host: env.VERCEL_URL,
	},
});

export async function getCurrentUser(): Promise<User | undefined> {
	const authReq = auth.handleRequest("GET", context);
	const session = await authReq.validate();

	return session?.user;
}

export type Auth = typeof auth;
