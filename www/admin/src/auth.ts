import { cookies } from "next/headers";
import { lucia } from "lucia";
import { nextjs } from "lucia/middleware";
import { prisma } from "@lucia-auth/adapter-prisma";
import "lucia/polyfill/node";
import bcrypt from "bcrypt";
import { prisma as prismaClient } from "@admin/prisma/client";
import { env } from "@admin/src/env/server.mjs";
import { url } from "./utils/server";

export const auth = lucia({
	adapter: prisma(prismaClient, {
		user: "user",
		session: "session",
		key: "key",
	}),
	env: env.NODE_ENV !== "production" ? "DEV" : "PROD", // DEV means http, PROD means https
	middleware: nextjs(),
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
	allowedRequestOrigins: [url()],
});

export const getCurrentUser = async () => {
	const authReq = auth.handleRequest({ request: null, cookies });
	const session = await authReq.validate();

	return session?.user;
};

export type Auth = typeof auth;
