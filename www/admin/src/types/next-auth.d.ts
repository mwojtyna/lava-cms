/* eslint @typescript-eslint/no-unused-vars: off */
import type { DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";

interface User {
	id: string;
}

declare module "next-auth" {
	/**
	 * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
	 */
	interface Session {
		user?: User;
	}

	interface JWT {
		user?: User;
	}
}
declare module "next-auth/jwt" {
	/** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
	interface JWT {
		user?: User;
	}
}
