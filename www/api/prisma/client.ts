import { PrismaClient } from "@prisma/client";
import { env } from "@api/env/server";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		log: ["query"],
	});

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
