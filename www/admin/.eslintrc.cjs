/** @type {import("eslint").Linter.Config} */
module.exports = {
	extends: [
		"next/core-web-vitals",
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/recommended-requiring-type-checking",
	],
	plugins: ["@typescript-eslint"],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: true,
		tsconfigRootDir: __dirname,
	},
	ignorePatterns: [".eslintrc.cjs"],
	rules: {
		"@typescript-eslint/no-non-null-assertion": "off",
		"@typescript-eslint/consistent-type-imports": "warn",
		"@typescript-eslint/no-unused-vars": ["warn", { ignoreRestSiblings: true }],
		"@typescript-eslint/consistent-type-imports": ["warn", { disallowTypeAnnotations: false }],
		"@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
	},
	overrides: [
		{
			files: ["*.test.ts"],
			rules: {
				"@typescript-eslint/unbound-method": "off",
			},
		},
	],
};
