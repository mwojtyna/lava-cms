import { Prisma } from "@prisma/client";

const user = Prisma.validator<prisma.userArgs>()({});
export type User = prisma.userGetPayload<typeof user>;
