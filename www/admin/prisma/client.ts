import { PrismaClient } from "@prisma/client";
import { env } from "@/src/env/server.mjs";

declare global {
	// eslint-disable-next-line no-var
	var prisma: undefined | PrismaClient;
}

export const prisma =
	global.prisma ??
	new PrismaClient({
		log: ["query", "info", "warn", "error"],
	});

if (env.NODE_ENV !== "production") {
	// https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices
	global.prisma = prisma;
}
