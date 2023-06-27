import { cookies } from "next/headers";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@admin/src/trpc/routes/_app";
import { createContext } from "@admin/src/trpc";
import { env } from "@admin/src/env/server.mjs";

const url = `${env.NODE_ENV === "production" ? "https" : "http"}://${env.VERCEL_URL}`;

const handler = async (req: Request) => {
	const res = await fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: () => createContext(cookies),
	});
	res.headers.set("Access-Control-Allow-Origin", url);
	res.headers.set("Access-Control-Allow-Credentials", "true");

	return res;
};
export { handler as GET, handler as POST };

export const OPTIONS = () =>
	new Response(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": url,
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
			"Access-Control-Allow-Credentials": "true",
		},
	});
