import { expect, it } from "vitest";
import { caller } from "@api/trpc/routes/_app";

it("returns a greeting with the provided name", async () => {
	const { greeting } = await caller.auth.greeting({ name: "Test" });

	expect(greeting).toBe("Hello Test");
});
