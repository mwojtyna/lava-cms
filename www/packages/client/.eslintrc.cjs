/** @type {import("eslint").Linter.Config} */
module.exports = {
	extends: ["package"],
	parserOptions: {
		project: ["./tsconfig.json"],
		tsconfigRootDir: __dirname,
	},
};
