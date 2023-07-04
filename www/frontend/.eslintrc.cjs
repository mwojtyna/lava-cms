/** @type {import("eslint").Linter.Config} */
module.exports = {
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/recommended-requiring-type-checking",
		"plugin:astro/recommended",
	],
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
			rules: {
				"@typescript-eslint/no-non-null-assertion": "off",
				"@typescript-eslint/consistent-type-imports": "warn",
				"@typescript-eslint/no-unused-vars": ["warn", { ignoreRestSiblings: true }],
			},
		},
	],
	parserOptions: {
		project: true,
		tsConfigRootDir: __dirname,
	},
	rules: {
		"@typescript-eslint/no-non-null-assertion": "off",
		"@typescript-eslint/consistent-type-imports": "warn",
		"@typescript-eslint/no-unused-vars": ["warn", { ignoreRestSiblings: true }],
	},
};
