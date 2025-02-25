import { listen } from "@tauri-apps/api/event";
import { debug } from "@tauri-apps/plugin-log";
import { useRef, useState } from "react";

// listens for open_window and close_window events
export const useOpenWindow = () => {
	const [windowIsOpen, setWindowIsOpen] = useState(false);
	const throttle = useRef(false);
	const throttleWait = 100; // 1 second

	listen("open_window", (event) => {
		// if  throttled, ignore
		if (throttle.current) return;
		throttle.current = true;
		//set state
		console.log(event);
		debug("Opening Window");

		// set throttle to throttleWait ms
		setTimeout(() => {
			throttle.current = false;
		}, throttleWait);
		setWindowIsOpen(true);
	});
	listen("close_window", (event) => {
		if (throttle.current) return;
		throttle.current = true;
		debug("Closing Window");

		// set throttle to throttleWait ms
		setTimeout(() => {
			throttle.current = false;
		}, throttleWait);
		setWindowIsOpen(false);
	});

	return windowIsOpen;
};
