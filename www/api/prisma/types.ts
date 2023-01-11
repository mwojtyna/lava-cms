import { Prisma } from "@prisma/client";

const user = Prisma.validator<Prisma.usersArgs>()({});

export type User = Prisma.usersGetPayload<typeof user>;
