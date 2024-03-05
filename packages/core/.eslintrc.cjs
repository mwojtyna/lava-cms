/** @type {import("eslint").Linter.Config} */
module.exports = {
	parserOptions: {
		project: true,
		tsconfigRootDir: __dirname,
	},
	extends: ["package"],
};
