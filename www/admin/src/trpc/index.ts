import type { cookies as nextCookies } from "next/headers";
import { initTRPC } from "@trpc/server";
import SuperJSON from "superjson";
import { auth } from "@admin/src/auth";

const t = initTRPC.context<typeof createContext>().create({ transformer: SuperJSON });

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;

export const createContext = (cookies: typeof nextCookies) => {
	const authReq = auth.handleRequest({
		cookies,
	});

	return { authReq };
};
