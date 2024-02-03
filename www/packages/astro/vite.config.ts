import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import string from "vite-plugin-string";

export default defineConfig({
	build: {
		outDir: "dist",
		lib: {
			entry: resolve(__dirname, "./index.ts"),
			fileName: "index", // File name for the output file
			formats: ["es"],
		},
		rollupOptions: {
			external: ["@lavacms/core", "camelcase"],
		},
	},
	plugins: [dts({ rollupTypes: true }), string({ include: "./src/bridge.ts" })],
});
