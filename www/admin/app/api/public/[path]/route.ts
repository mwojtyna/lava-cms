import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { publicRouter } from "@/src/trpc/routes/public/_public";

const handler = async (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api/public",
		req,
		router: publicRouter,
		createContext: () => ({}),
	});

export { handler as GET, handler as POST };
