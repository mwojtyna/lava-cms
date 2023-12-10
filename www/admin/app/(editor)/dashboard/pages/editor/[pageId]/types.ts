import type { inferRouterOutputs } from "@trpc/server";
import type { PrivateRouter } from "@admin/src/trpc/routes/private/_private";

export type Component = inferRouterOutputs<PrivateRouter>["pages"]["getPageComponents"][number];
