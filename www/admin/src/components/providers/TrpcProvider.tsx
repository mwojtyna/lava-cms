"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { SessionProvider } from "next-auth/react";
import SuperJSON from "superjson";
import { trpcReact } from "@admin/src/utils/trpcReact";
import { env } from "@admin/src/env/client.mjs";

export function TrpcProvider(props: { children: React.ReactNode }) {
	const [queryClient] = useState(new QueryClient());
	const [trpcClient] = useState(
		trpcReact.createClient({
			links: [
				loggerLink({
					enabled: () => !!env.NEXT_PUBLIC_DEV,
				}),
				httpBatchLink({
					url: "/admin/api/trpc",
					headers: {
						"x-trpc-origin": "client",
					},
				}),
			],
			transformer: SuperJSON,
		})
	);

	return (
		<SessionProvider basePath="/admin/api/auth">
			<trpcReact.Provider client={trpcClient} queryClient={queryClient}>
				<QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
			</trpcReact.Provider>
		</SessionProvider>
	);
}
