import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { privateRouter } from "@admin/src/trpc/routes/private/_private";

const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api/private",
		req,
		router: privateRouter,
		createContext: () => ({}),
	});

export { handler as GET, handler as POST };
