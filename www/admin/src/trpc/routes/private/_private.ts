import { router } from "@admin/src/trpc";
import { authRouter } from "./auth/_auth";
import { configRouter } from "./config/_config";
import { pagesRouter } from "./pages/_pages";
import { componentsRouter } from "./components/_components";

export const privateRouter = router({
	auth: authRouter,
	config: configRouter,
	pages: pagesRouter,
	components: componentsRouter,
});

export const caller = privateRouter.createCaller({});

export type PrivateRouter = typeof privateRouter;
