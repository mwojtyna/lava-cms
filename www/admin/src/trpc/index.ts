import { TRPCError, initTRPC } from "@trpc/server";
import * as context from "next/headers";
import superjson from "superjson";
import { prisma } from "@/prisma/client";
import { auth } from "@/src/auth";
import { env } from "../env/server.mjs";

export interface ServerMeta {
	noAuth: boolean;
}

const t = initTRPC.meta<ServerMeta>().create({ transformer: superjson });

export const router = t.router;

export const privateAuth = t.middleware(async (opts) => {
	if (context.headers().has("Referer")) {
		// "Origin" header is sometimes null
		const origin = new URL(context.headers().get("Referer")!).host;
		if (env.VERCEL_URL !== origin) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: `VERCEL_URL "${env.VERCEL_URL}" and actual hostname "${origin}" don't match!`,
			});
		}
	}

	const authReq = auth.handleRequest(opts.type == "query" ? "GET" : "POST", context);
	const session = await authReq.validate();
	const ctx = {
		setSession: authReq.setSession,
		session,
	};

	if (opts.meta?.noAuth || (await prisma.settingsSeo.count()) === 0) {
		return opts.next({ ctx });
	}

	if (!session) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	return opts.next({
		ctx,
	});
});
export const publicAuth = t.middleware(async (opts) => {
	const token = auth.readBearerToken(context.headers().get("Authorization"));
	if (!token || token !== (await prisma.settingsConnection.findFirst())?.token) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	return opts.next();
});

export const privateProcedure = t.procedure.use(privateAuth);
export const publicProcedure = t.procedure.use(publicAuth);
