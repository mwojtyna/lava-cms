import { router } from "@api/trpc";
import { addPage } from "./addPage";
import { getPage } from "./getPage";
import { editPage } from "./editPage";
import { deletePage } from "./deletePage";
import { movePage } from "./movePage";
import { getTopLevelPages } from "./getTopLevelPages";

export const pagesRouter = router({
	addPage,
	getPage,
	editPage,
	deletePage,
	movePage,
	getTopLevelPages,
});

export type PagesRouter = typeof pagesRouter;
