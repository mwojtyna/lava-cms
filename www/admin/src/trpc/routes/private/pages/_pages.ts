import { router } from "@/src/trpc";
import { addPage } from "./addPage";
import { checkConflict } from "./checkConflict";
import { deletePage } from "./deletePage";
import { editPage } from "./editPage";
import { editPageComponents } from "./editPageComponents";
import { getAllGroups } from "./getAllGroups";
import { getGroup } from "./getGroup";
import { getGroupContents } from "./getGroupContents";
import { getPageComponents } from "./getPageComponents";
import { movePage } from "./movePage";

export const pagesRouter = router({
	addPage,
	checkConflict,
	deletePage,
	editPage,
	editPageComponents,
	getPageComponents,
	getAllGroups,
	getGroup,
	getGroupContents,
	movePage,
});
