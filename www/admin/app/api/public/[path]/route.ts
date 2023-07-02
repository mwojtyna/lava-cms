import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { publicRouter } from "@admin/src/trpc/routes/public/_public";

const handler = async (req: Request) => {
	const res = await fetchRequestHandler({
		endpoint: "/api/public",
		req,
		router: publicRouter,
		createContext: () => ({}),
	});

	return res;
};
export { handler as GET, handler as POST };
