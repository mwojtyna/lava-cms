import { cookies } from "next/headers";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { publicRouter } from "@admin/src/trpc/routes/public/_public";
import { createContext } from "@admin/src/trpc";

const handler = async (req: Request) => {
	const res = await fetchRequestHandler({
		endpoint: "/api/public",
		req,
		router: publicRouter,
		createContext: () => createContext(cookies),
	});

	return res;
};
export { handler as GET, handler as POST };
