import typescript from "@rollup/plugin-typescript";
import { string } from "rollup-plugin-string";
import terser from "@rollup/plugin-terser";

/** @type {import("rollup").RollupOptions} */
export default {
	input: ["./index.ts"],
	output: [
		{
			file: "./dist/index.js",
			format: "es",
		},
		{
			file: "./dist/index.min.js",
			format: "es",
			plugins: [terser()],
		},
	],
	plugins: [
		typescript(),
		string({
			include: "./src/script.ts",
		}),
	],
	external: ["@lavacms/core", "camelcase"],
};
