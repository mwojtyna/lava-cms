import type { Auth } from "../auth";
import type { AdminUser } from "@prisma/client";

declare module "lucia" {
	interface Register {
		Lucia: Auth;
		DatabaseSessionAttributes: DatabaseSessionAttributes;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

type DatabaseUserAttributes = Pick<AdminUser, "email" | "name" | "last_name">;
type DatabaseSessionAttributes = Record<string, never>;
