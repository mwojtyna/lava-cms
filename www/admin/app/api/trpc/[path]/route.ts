import { cookies } from "next/headers";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@admin/src/trpc/routes/_app";
import { createContext } from "@admin/src/trpc";

const handler = async (req: Request) => {
	const res = await fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: () => createContext(cookies),
	});

	return res;
};
export { handler as GET, handler as POST };

export const OPTIONS = () =>
	new Response(null, {
		status: 204,
	});
