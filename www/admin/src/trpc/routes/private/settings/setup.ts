import { privateProcedure } from "@admin/src/trpc";
import { caller } from "../_private";

export const setup = privateProcedure.mutation(async () => {
	await caller.pages.addPage({
		name: "Root",
		url: "",
		isGroup: true,
		parentId: null,
	});
	await caller.components.addGroup({
		name: "Root",
		parentId: null,
	});

	await caller.auth.generateToken();
	await caller.settings.setConnectionSettings({
		developmentUrl: "http://localhost:3000",
	});
});
