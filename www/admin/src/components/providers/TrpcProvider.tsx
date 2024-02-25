"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { useState } from "react";
import superjson from "superjson";
import { env } from "@/src/env/client.mjs";
import { useToast } from "@/src/hooks/useToast";
import { trpc } from "@/src/utils/trpc";

export function TrpcProvider({ children }: { children: React.ReactNode }) {
	const { toastError } = useToast();

	const [trpcClient] = useState(
		trpc.createClient({
			links: [
				loggerLink({ enabled: () => !!env.NEXT_PUBLIC_DEV }),
				httpBatchLink({
					url: "/admin/api/private",
				}),
			],
			transformer: superjson,
		}),
	);
	const [queryClient] = useState(
		new QueryClient({
			defaultOptions: {
				queries: {
					refetchOnWindowFocus: false,
				},
			},
			queryCache: new QueryCache({
				onError: (err) => {
					const error = err as { data?: { httpStatus: number } };
					if (error.data?.httpStatus === 500) {
						toastError({
							title: "Error",
							description: "Failed to fetch data.",
						});
					}
				},
			}),
			mutationCache: new MutationCache({
				onError: (err) => {
					const error = err as { data?: { httpStatus: number } };
					if (error.data?.httpStatus === 500) {
						toastError({
							title: "Error",
							description: "Failed to perform action.",
						});
					}
				},
			}),
		}),
	);

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</trpc.Provider>
	);
}
