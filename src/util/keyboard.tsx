export const disableRefresh = () => {
	const keyDown = (event: KeyboardEvent) => {
		if (
			event.key === "F5" ||
			(event.ctrlKey && event.key === "r") ||
			(event.metaKey && event.key === "r")
		) {
			event.preventDefault();
		}
	};
	window.addEventListener("keydown", keyDown);
};

export const disableCtrlF = () => {
	const keyDown = (event: KeyboardEvent) => {
		if (event.ctrlKey && event.key === "f") {
			event.preventDefault();
		}
	};
	window.addEventListener("keydown", keyDown);
};
