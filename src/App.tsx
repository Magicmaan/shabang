import { useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./styles/App.css";
import SearchBar from "./components/ui/SearchBar";
import FakeBackground from "./components/FakeBackground.tsx";
import QuickWidgets from "./components/ui/QuickWidgets.tsx";
import ResultsContainer from "./components/ui/Results/index.tsx";
import { useDarkMode } from "./hooks/useDarkMode.tsx";
import Widget from "./components/ui/base/Widget.tsx";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { TrayIcon } from "@tauri-apps/api/tray";
import { Menu } from "@tauri-apps/api/menu";
import { defaultWindowIcon } from "@tauri-apps/api/app";
import { register, ShortcutEvent } from "@tauri-apps/plugin-global-shortcut";
import {
	warn,
	debug,
	trace,
	info,
	error,
	attachConsole,
	attachLogger,
} from "@tauri-apps/plugin-log";

import { openPath } from "@tauri-apps/plugin-opener";
import { listen } from "@tauri-apps/api/event";
import { useOpenWindow } from "./hooks/useOpenWindow.tsx";
import { disableCtrlF, disableRefresh } from "./util/keyboard.tsx";
import { useSearchStore } from "./hooks/search/useSearch.tsx";

function App() {
	const [greetMsg, setGreetMsg] = useState("");
	const [name, setName] = useState("");
	const [theme, setTheme] = useDarkMode();
	const windowIsOpen = useOpenWindow();
	const ref = useRef<HTMLDivElement>(null);

	const store = useSearchStore((state) => state);

	disableRefresh();
	disableCtrlF();

	async function greet() {
		// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
		setGreetMsg(await invoke("greet", { name }).then((res) => console.log(res)));
	}

	async function closeWindow() {
		debug("Close Window");
		// send command to close window to rust
		await invoke("close_window_js", {}).then((res) => console.log(res));
	}

	async function openTest() {
		await invoke("open_link_js", { link: "https://www.google.com" });
	}
	debug("search from app.tsx: " + store.searchQuery);
	useEffect(() => {
		const handlePointerDown = (e: PointerEvent) => {
			if (e.currentTarget === e.target) {
				debug("Root Clicked");
				closeWindow();
			}
		};
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				debug("is focused " + store.isSearching);
				if (store.isSearching) {
					debug("Escape Pressed While Searching");
					store.setIsSearching(false);
					return;
				}
				debug("Escape Pressed");
				closeWindow();
			}
		};
		document.addEventListener("keydown", handleEscape);

		ref.current?.parentElement?.addEventListener("pointerdown", handlePointerDown);
		ref.current?.addEventListener("pointerdown", handlePointerDown);
		return () => {
			document.removeEventListener("keydown", handleEscape);
			ref.current?.parentElement?.removeEventListener("pointerdown", handlePointerDown);
			ref.current?.removeEventListener("pointerdown", handlePointerDown);
		};
	}, []);

	return (
		<main
			ref={ref}
			data-root
			onPointerDown={(e) => {
				debug("Pointer Down");
				if (e.currentTarget === e.target) {
					debug("Root Clicked");
					//closeWindow();
				}
			}}
			className={`dark w-lvw h-1/2 translate bg-red-500/10 p-20 drop-shadow-md center flex flex-col transition-all translate-y-1/2 duration-500 overflow-y-hidden ${
				windowIsOpen ? " " : "close-window"
			}`}>
			<div className="w-full flex flex-row h-full justify-stretch items-stretch origin-top gap-2.5">
				<div className="h-full w-1/3 flex justify-end items-start">
					<div className="w-auto h-full flex flex-col items-center justify-between gap-2.5">
						<QuickWidgets />
						<Widget
							className=""
							onPointerDown={() =>
								setTheme((prev) => (prev === "light" ? "dark" : "light"))
							}>
							g
						</Widget>
					</div>
				</div>
				<div className="h-max w-1/3 flex flex-col gap-2.5 justify-stretch items-stretch">
					<SearchBar />
					<ResultsContainer />
				</div>
				<div className="bg-red-500 h-full w-1/3">g</div>
			</div>
		</main>
	);
}

export default App;
