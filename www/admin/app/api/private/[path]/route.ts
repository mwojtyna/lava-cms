import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { privateRouter } from "@admin/src/trpc/routes/private/_private";

const handler = async (req: Request) => {
	const res = await fetchRequestHandler({
		endpoint: "/api/private",
		req,
		router: privateRouter,
		createContext: () => ({}),
	});

	return res;
};
export { handler as GET, handler as POST };
