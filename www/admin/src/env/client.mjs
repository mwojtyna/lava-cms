// @ts-check
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	client: {
		NEXT_PUBLIC_DEV: z.string().optional(),
	},
	experimental__runtimeEnv: {
		NEXT_PUBLIC_DEV: process.env.NEXT_PUBLIC_DEV,
	},
});
