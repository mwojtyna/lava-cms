window.addEventListener("load", () => {
	const all = document.querySelectorAll("*, *::before, *::after");
	all.forEach((el) => {
		el.addEventListener("click", (e) => {
			e.preventDefault();
		});
	});
});

// This is only for proper types when importing, this file gets converted to a string during build
export default "";
