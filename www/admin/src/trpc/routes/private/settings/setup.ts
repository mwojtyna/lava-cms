import { prisma } from "@/prisma/client";
import { privateProcedure } from "@/src/trpc";
import { caller } from "../_private";
import { randomString } from "../auth/generateToken";

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

	await prisma.settingsConnection.create({
		data: {
			development_url: "http://localhost:3000/",
			token: randomString(),
		},
	});
});
