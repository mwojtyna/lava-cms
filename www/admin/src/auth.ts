import { cookies } from "next/headers";
import lucia from "lucia-auth";
import { nextjs } from "lucia-auth/middleware";
import prisma from "@lucia-auth/adapter-prisma";
import { createId } from "@paralleldrive/cuid2";
import "lucia-auth/polyfill/node";
import bcrypt from "bcrypt";
import { prisma as prismaClient } from "@admin/prisma/client";
import { env } from "@admin/src/env/server.mjs";

export const auth = lucia({
	adapter: prisma(prismaClient),
	env: env.NODE_ENV !== "production" ? "DEV" : "PROD", // DEV means http, PROD means https
	middleware: nextjs(),
	transformDatabaseUser: (user) => ({
		id: user.id,
		name: user.name,
		lastName: user.last_name,
		email: user.email,
	}),
	sessionExpiresIn: {
		activePeriod: 1000 * 60 * 60 * 24 * 7, // 1 week
		idlePeriod: 0, // disable session renewal
	},
	generateCustomUserId: createId,
	hash: {
		generate: (password) => bcrypt.hash(password, 10),
		validate: (password, hash) => bcrypt.compare(password, hash),
	},
	sessionCookie: {
		sameSite: "strict",
		path: "/admin",
	},
});

export const getCurrentUser = async () => {
	const authRequest = auth.handleRequest({ cookies });
	const sessionUser = await authRequest.validateUser();

	return sessionUser.user;
};

export type Auth = typeof auth;
