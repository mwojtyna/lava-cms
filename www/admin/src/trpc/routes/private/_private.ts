import { router } from "@admin/src/trpc";
import { authRouter } from "./auth/_auth";
import { settingsRouter } from "./settings/_config";
import { pagesRouter } from "./pages/_pages";
import { componentsRouter } from "./components/_components";

export const privateRouter = router({
	auth: authRouter,
	settings: settingsRouter,
	pages: pagesRouter,
	components: componentsRouter,
});

export const caller = privateRouter.createCaller({});

export type PrivateRouter = typeof privateRouter;
