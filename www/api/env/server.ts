/**
 * This file is included in `/next.config.mjs` which ensures the app isn't built with invalid env vars.
 * It has to be a `.mjs`-file to be imported there.
 */
import { formatErrors, serverSchema } from "./schema";
import dotenv from "dotenv";

export let env: ReturnType<typeof serverSchema.parse>;

export function reload() {
	dotenv.config();
	const _serverEnv = serverSchema.safeParse(process.env);

	if (!_serverEnv.success) {
		console.error(
			"❌ Invalid environment variables:\n",
			...formatErrors(_serverEnv.error.format())
		);
		throw new Error("Invalid environment variables");
	}

	for (const key of Object.keys(_serverEnv.data)) {
		if (key.startsWith("NEXT_PUBLIC_")) {
			console.warn("❌ You are exposing a server-side env-variable:", key);

			throw new Error("You are exposing a server-side env-variable");
		}
	}

	env = { ..._serverEnv.data };
}
reload();
