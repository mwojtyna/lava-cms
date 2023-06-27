import { Prisma } from "@prisma/client";

const user = Prisma.validator<Prisma.AuthUserArgs>()({});
export type User = Prisma.AuthUserGetPayload<typeof user>;

const config = Prisma.validator<Prisma.ConfigArgs>()({});
export type Config = Prisma.ConfigGetPayload<typeof config>;

const page = Prisma.validator<Prisma.PageArgs>()({});
export type Page = Prisma.PageGetPayload<typeof page>;
