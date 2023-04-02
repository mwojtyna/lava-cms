import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "api/trpc/routes/_app";

export const trpcReact = createTRPCReact<AppRouter>({
	unstable_overrides: {
		useMutation: {
			onSuccess: async (opts) => {
				await opts.originalFn();
				await opts.queryClient.invalidateQueries();
			},
		},
	},
});
