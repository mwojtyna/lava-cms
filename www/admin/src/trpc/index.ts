import { cookies, headers } from "next/headers";
import { TRPCError, initTRPC } from "@trpc/server";
import SuperJSON from "superjson";
import bcrypt from "bcrypt";
import { auth } from "@admin/src/auth";
import { prisma } from "@admin/prisma/client";

interface Meta {
	noAuth: boolean;
}

const t = initTRPC.meta<Meta>().create({ transformer: SuperJSON });

export const router = t.router;

export const privateAuth = t.middleware(async (opts) => {
	const authReq = auth.handleRequest({
		request: null,
		cookies,
	});
	const session = await authReq.validate();
	const ctx = {
		setSession: authReq.setSession,
		session,
	};

	if (opts.meta?.noAuth || (await prisma.config.count()) === 0) {
		return opts.next({
			ctx,
		});
	}

	if (!session) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	return opts.next({
		ctx,
	});
});
export const publicAuth = t.middleware(async (opts) => {
	const token = auth.readBearerToken(headers().get("Authorization"));
	if (!token) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	const match = await bcrypt.compare(token, (await prisma.token.findFirst())?.token ?? "");
	if (!match) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	return opts.next();
});

export const privateProcedure = t.procedure.use(privateAuth);
export const publicProcedure = t.procedure.use(publicAuth);
