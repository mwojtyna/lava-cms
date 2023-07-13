/** @type {import("eslint").Linter.Config} */
module.exports = {
	parserOptions: {
		project: true,
		tsconfigRootDir: __dirname,
	},
	extends: ["package"],
	ignorePatterns: [".eslintrc*"],
	overrides: [
		{
			// Define the configuration for `.astro` file.
			files: ["*.astro"],
			// Allows Astro components to be parsed.
			parser: "astro-eslint-parser",
			// Parse the script in `.astro` as TypeScript by adding the following configuration.
			// It's the setting you need when using TypeScript.
			parserOptions: {
				parser: "@typescript-eslint/parser",
				extraFileExtensions: [".astro"],
			},
		},
	],
	globals: {
		globalThis: true,
	},
};
