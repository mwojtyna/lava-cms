/** @type {import("eslint").Linter.Config} */
module.exports = {
	parserOptions: {
		project: true,
		tsconfigRootDir: __dirname,
	},
	extends: ["package", "plugin:astro/recommended"],
	ignorePatterns: ["rollup.config.js"],
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
				sourceType: "module",
			},
			rules: {
				"import/namespace": "off",
				"import/default": "off",
				"import/no-named-as-default": "off",
				"import/no-named-as-default-member": "off",
			},
		},
	],
	rules: {
		"import/no-unresolved": "off",
	},
};
