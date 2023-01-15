/** @type {import("prettier").Config} */
module.exports = {
	printWidth: 100,
	tabWidth: 4,
	useTabs: true,
	endOfLine: "lf",
	plugins: [require.resolve("prettier-plugin-tailwindcss")],
};
