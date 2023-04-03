import { router } from "@api/trpc";
import { addPage } from "./addPage";

export const pagesRouter = router({
	addPage,
});

export type PagesRouter = typeof pagesRouter;
