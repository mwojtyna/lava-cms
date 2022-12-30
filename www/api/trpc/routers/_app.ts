import { router } from "../trpc";
import { greeting } from "./greeting";

export const appRouter = router({
	greeting
});

export type AppRouter = typeof appRouter;
