import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./routers/_app";

// Can't use dotenv here because it's a client-side file
export const client = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `http://localhost:4000/trpc`
		})
	]
});