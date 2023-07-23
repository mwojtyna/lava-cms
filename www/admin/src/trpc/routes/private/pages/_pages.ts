import { router } from "@admin/src/trpc";
import { addPage } from "./addPage";
import { editPage } from "./editPage";
import { deletePage } from "./deletePage";
import { movePage } from "./movePage";
import { getGroupContents } from "./getGroupContents";
import { getGroup } from "./getGroup";
import { getAllGroups } from "./getAllGroups";
import { checkConflict } from "./checkConflict";

export const pagesRouter = router({
	addPage,
	checkConflict,
	deletePage,
	editPage,
	getAllGroups,
	getGroup,
	getGroupContents,
	movePage,
});
