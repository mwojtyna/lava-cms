import { router } from "@api/trpc";
import { addPage } from "./addPage";
import { getPage } from "./getPage";
import { getPages } from "./getPages";
import { editPage } from "./editPage";
import { deletePage } from "./deletePage";
import { movePage } from "./movePage";

export const pagesRouter = router({
	addPage,
	getPage,
	getPages,
	editPage,
	deletePage,
	movePage,
});

export type PagesRouter = typeof pagesRouter;
