// @ts-check
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const boolish = z
	.union([z.literal("true"), z.literal("false")])
	.optional()
	.transform((val) => {
		switch (val) {
			case "true":
				return true;
			case "false":
				return false;
			case undefined:
				return undefined;
		}
	});

export const env = createEnv({
	client: {
		NEXT_PUBLIC_DEV: boolish,
		NEXT_PUBLIC_DEMO: boolish,
		NEXT_PUBLIC_DEMO_EMAIL: z.string().optional(),
		NEXT_PUBLIC_DEMO_PASSWORD: z.string().optional(),
	},
	experimental__runtimeEnv: {
		NEXT_PUBLIC_DEV: process.env.NEXT_PUBLIC_DEV,
		NEXT_PUBLIC_DEMO: process.env.NEXT_PUBLIC_DEMO,
		NEXT_PUBLIC_DEMO_EMAIL: process.env.NEXT_PUBLIC_DEMO_EMAIL,
		NEXT_PUBLIC_DEMO_PASSWORD: process.env.NEXT_PUBLIC_DEMO_PASSWORD,
	},
});
