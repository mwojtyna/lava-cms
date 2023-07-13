/** @type {import("eslint").Linter.Config} */
module.exports = {
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended-type-checked",
		"plugin:@typescript-eslint/stylistic-type-checked",
	],
	plugins: ["@typescript-eslint"],
	parser: "@typescript-eslint/parser",
	ignorePatterns: ["dist", ".eslintrc.cjs"],
	rules: {
		"@typescript-eslint/no-non-null-assertion": "off",
		"@typescript-eslint/consistent-type-imports": "warn",
		"@typescript-eslint/no-unused-vars": ["warn", { ignoreRestSiblings: true }],
		"@typescript-eslint/consistent-type-imports": ["warn", { disallowTypeAnnotations: false }],
		"@typescript-eslint/no-namespace": "off",
	},
};
