import { prisma } from "@admin/prisma/client";
import { publicProcedure } from "@admin/src/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const getPaths = publicProcedure
	.input(
		z.object({
			groupUrl: z.string(),
		}),
	)
	.query(async ({ input }): Promise<string[]> => {
		const group = await prisma.page.findFirst({
			where: {
				url: input.groupUrl,
				is_group: true,
			},
			// Only include pages that aren't groups or index pages
			include: {
				children: {
					where: {
						is_group: false,
						url: {
							not: {
								endsWith: "/",
							},
						},
					},
				},
			},
		});

		if (!group) {
			throw new TRPCError({ code: "NOT_FOUND" });
		}

		return group.children.map((child) => child.url.split("/").pop()!);
	});
