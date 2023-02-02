import { createTRPCMsw } from "msw-trpc";
import type { AppRouter } from "api/trpc/routes/_app";

export const trpcMsw = createTRPCMsw<AppRouter>();
