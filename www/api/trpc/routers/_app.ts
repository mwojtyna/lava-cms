import { router } from "../trpc";
import { greeting } from "./greeting";
import { getUser } from "./getUser";

export const appRouter = router({
	greeting,
	getUser
});

export type AppRouter = typeof appRouter;
