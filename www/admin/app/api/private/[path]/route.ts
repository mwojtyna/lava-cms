import { cookies } from "next/headers";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { privateRouter } from "@admin/src/trpc/routes/private/_private";
import { createContext } from "@admin/src/trpc";

const handler = async (req: Request) => {
	const res = await fetchRequestHandler({
		endpoint: "/api/private",
		req,
		router: privateRouter,
		createContext: () => createContext(cookies),
	});

	return res;
};
export { handler as GET, handler as POST };
