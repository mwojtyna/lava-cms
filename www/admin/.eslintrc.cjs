/** @type {import("eslint").Linter.Config} */
module.exports = {
	extends: [
		"next/core-web-vitals",
		"plugin:@typescript-eslint/recommended-type-checked",
		"plugin:@typescript-eslint/stylistic-type-checked",
		"plugin:import/recommended",
		"plugin:import/typescript",
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: true,
		tsconfigRootDir: __dirname,
	},
	ignorePatterns: [".eslintrc.cjs", "playwright-report", "generated"],
	rules: {
		"@typescript-eslint/no-non-null-assertion": "off",
		"@typescript-eslint/consistent-type-imports": "warn",
		"@typescript-eslint/no-unused-vars": [
			"warn",
			{ ignoreRestSiblings: true, argsIgnorePattern: "^_$" },
		],
		"@typescript-eslint/consistent-type-imports": ["warn", { disallowTypeAnnotations: false }],
		"@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
		"@typescript-eslint/consistent-type-definitions": "off",
		"@typescript-eslint/array-type": "off",
		"@typescript-eslint/prefer-nullish-coalescing": ["error", { ignoreConditionalTests: true }],
		"import/order": [
			"warn",
			{
				groups: [
					"type",
					"builtin",
					"external",
					"internal",
					"parent",
					"sibling",
					"index",
					"object",
				],
				pathGroups: [
					{
						pattern: "@admin/**",
						group: "internal",
					},
				],
				alphabetize: {
					order: "asc",
					caseInsensitive: true,
				},
			},
		],
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
