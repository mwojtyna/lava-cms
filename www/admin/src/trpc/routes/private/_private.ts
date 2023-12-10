import { router } from "@/src/trpc";
import { authRouter } from "./auth/_auth";
import { componentsRouter } from "./components/_components";
import { pagesRouter } from "./pages/_pages";
import { settingsRouter } from "./settings/_config";

export const privateRouter = router({
	auth: authRouter,
	settings: settingsRouter,
	pages: pagesRouter,
	components: componentsRouter,
});

export const caller = privateRouter.createCaller({});

export type PrivateRouter = typeof privateRouter;
