/** @type {import("eslint").Linter.Config} */
module.exports = {
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: "./tsconfig.json",
		tsconfigRootDir: __dirname,
		sourceType: "module",
	},
	ignorePatterns: [".eslintrc.cjs"],
	plugins: ["@typescript-eslint"],
	extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
	rules: {
		"@typescript-eslint/consistent-type-imports": "warn",
		"@typescript-eslint/no-non-null-assertion": "off",
	},
};
