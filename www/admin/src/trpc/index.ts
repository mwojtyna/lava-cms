import * as context from "next/headers";
import { TRPCError, initTRPC } from "@trpc/server";
import SuperJSON from "superjson";
import { auth } from "@admin/src/auth";
import { prisma } from "@admin/prisma/client";

export interface Meta {
	noAuth: boolean;
}

const t = initTRPC.meta<Meta>().create({ transformer: SuperJSON });

export const router = t.router;

export const privateAuth = t.middleware(async (opts) => {
	const authReq = auth.handleRequest(opts.type == "query" ? "GET" : "POST", context);
	const session = await authReq.validate();
	const ctx = {
		setSession: authReq.setSession,
		session,
	};

	if (opts.meta?.noAuth || (await prisma.config.count()) === 0) {
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
	if (!token) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	if (token !== (await prisma.token.findFirst())?.token) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	return opts.next();
});

export const privateProcedure = t.procedure.use(privateAuth);
export const publicProcedure = t.procedure.use(publicAuth);
