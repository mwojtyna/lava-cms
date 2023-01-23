import { describe, expect, it } from "vitest";
import { caller } from "./_router";

describe("greeting", () => {
	it("returns a greeting with the provided name", async () => {
		const { greeting } = await caller.greeting({ name: "Test" });

		expect(greeting).toBe("Hello Test");
	});
});
