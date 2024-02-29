import { TRPCError, initTRPC } from "@trpc/server";
import { headers } from "next/headers";
import { SuperJSON } from "superjson";
import { prisma } from "@/prisma/client";
import { auth, validateRequest } from "@/src/auth";
import { env } from "../env/server.mjs";

export interface ServerMeta {
	noAuth: boolean;
}

const t = initTRPC.meta<ServerMeta>().create({ transformer: SuperJSON });

export const router = t.router;

export const privateAuth = t.middleware(async (opts) => {
	if (headers().has("Referer")) {
		// "Origin" header is sometimes null
		const origin = new URL(headers().get("Referer")!).host;
		if (env.VERCEL_URL !== origin) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: `VERCEL_URL "${env.VERCEL_URL}" and actual hostname "${origin}" don't match!`,
			});
		}
	}

	if (opts.meta?.noAuth || (await prisma.adminUser.count()) === 0) {
		return opts.next();
	}

	const { session } = await validateRequest();
	if (!session) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	return opts.next();
});
export const publicAuth = t.middleware(async (opts) => {
	const authHeader = headers().get("Authorization");
	if (!authHeader) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	const cookieToken = auth.readBearerToken(authHeader);
	if (!cookieToken || cookieToken !== (await prisma.settingsConnection.findFirst())?.token) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	return opts.next();
});

export const privateProcedure = t.procedure.use(privateAuth);
export const publicProcedure = t.procedure.use(publicAuth);
