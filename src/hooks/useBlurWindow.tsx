import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { debug } from "@tauri-apps/plugin-log";
import { useRef, useState } from "react";

// listens for open_window and close_window events
export const UseBlurWindow = () => {
	const [windowBlurred, _setWindowBlurred] = useState(false);
	const throttle = useRef(false);
	const throttleWait = 50; // 1 second

	async function getBlur() {
		const blur = await invoke("get_blur_js", {}).then((res) => res as boolean);
		return blur;
	}

	async function setWindowBlurred(blur: boolean) {
		if (blur) {
			invoke("set_blur_js", {
				blur: true,

				colour: [255, 255, 255, 100],
				style: "Acrylic",
			});
		} else {
			invoke("set_blur_js", {
				blur: false,
				colour: [255, 255, 255, 100],
				style: "blur",
			});
		}
		const blurState = await getBlur();
		debug("Setting Blur: " + blurState);

		_setWindowBlurred(blurState);
	}

	return { windowBlurred, setWindowBlurred };
};
