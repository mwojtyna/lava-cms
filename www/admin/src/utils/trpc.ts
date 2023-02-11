import { createTRPCProxyClient, httpLink } from "@trpc/client";
import type { AppRouter } from "api/trpc/routes/_app";

export const trpc = createTRPCProxyClient<AppRouter>({
	links: [
		httpLink({
			url: typeof window === "undefined" ? "http://localhost:4000/trpc" : "/admin/api/trpc",
		}),
	],
});
