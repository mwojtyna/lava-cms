// @ts-check
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "production", "test"]),
		DB_URL: z.string(),
		ALLOWED_ORIGINS: z.string().optional(),
	},
	experimental__runtimeEnv: process.env,
});
