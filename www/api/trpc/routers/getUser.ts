import { publicProcedure } from "../trpc";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUser = publicProcedure
	.input(
		z.object({
			name: z.string()
		})
	)
	.query(async ({ input }) => {
		return await prisma.users.findFirstOrThrow({
			where: {
				name: {
					equals: input.name
				}
			}
		});
	});
