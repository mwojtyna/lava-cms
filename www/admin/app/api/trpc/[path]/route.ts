import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@admin/src/trpc/routes/_app";
import { initTRPC } from "@trpc/server";
import SuperJSON from "superjson";
import type { NextRequest } from "next/server";
import { env } from "@admin/src/env/server.mjs";
import { getToken } from "next-auth/jwt";

const handler = async (req: NextRequest) => {
	// Protects api routes on server and client
	// server: checks "x-ssr-token" header is present and matches NEXTAUTH_SECRET
	// client: checks if auth token is valid
	const token = await getToken({ req, secret: env.NEXTAUTH_SECRET });
	if (req.headers.get("x-ssr-token") !== env.NEXTAUTH_SECRET && !token) {
		return new Response(null, { status: 401 });
	}

	return fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: () => initTRPC.context().create({ transformer: SuperJSON }),
	});
};

export { handler as GET, handler as POST };
