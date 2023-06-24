import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@admin/src/trpc/routes/_app";
import { initTRPC } from "@trpc/server";
import SuperJSON from "superjson";

const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: () => initTRPC.context().create({ transformer: SuperJSON }),
	});

export { handler as GET, handler as POST };
