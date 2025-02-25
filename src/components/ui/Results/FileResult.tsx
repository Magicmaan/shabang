import { AppWindow } from "lucide-react";
import { File } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { useSearchStore } from "../../../hooks/search/useSearch";

const fileIcons: { [key: string]: LucideIcon } = {
	default: File,
	exe: AppWindow,
};

const fileShortcutAlias: { [key: string]: string } = {
	"AppData\\Local": "%LOCALAPPDATA%",
	AppData: "%APPDATA%",
	"Program Files": "%PROGRAMFILES%",
	"Program Files (x86)": "%PROGRAMFILES(X86)%",
	Windows: "%SYSTEMROOT%",
	UserProfile: "%USERPROFILE%",
};

// {7C5A40EF-A0FB-4BFC-874A-C0F2E0B9FA8E}

export const FileResult = ({ result }: { result: { name: string; path: string } }) => {
	const extension = result.name.split(".").pop() || "default";
	const Icon = fileIcons[extension] || fileIcons.default;
	const ref = useRef<HTMLDivElement>(null);

	const open = useSearchStore((state) => state.openFile);
	//format filePath
	//if the file path is longer than 50 characters, it will remove middle files and add ... to the start
	const formatPath = () => {
		const _filePath = result.path;
		var filePath = _filePath.split("\\").slice(0, -1).join("\\");

		for (const [key, value] of Object.entries(fileShortcutAlias)) {
			if (filePath.includes(key)) {
				filePath = filePath.split(key).pop() || "";
				filePath = value + filePath;
			}
		}

		filePath = filePath.replace(/\\/g, " / ");
		return filePath;
	};

	const filePath = formatPath();
	const fileName = result.name;

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			const { x, y } = ref.current?.getBoundingClientRect() || { x: 0, y: 0 };
			ref.current?.style.setProperty("--shiny-x", `${e.clientX - x}px`);
			ref.current?.style.setProperty("--shiny-y", `${e.clientY - y}px`);
			ref.current?.style.setProperty("--shiny-size", `500px`);
		};

		ref.current?.parentElement?.addEventListener("mousemove", handleMouseMove);
		return () => {
			ref.current?.parentElement?.removeEventListener("mousemove", handleMouseMove);
		};
	}, []);

	return (
		<div
			className="shiny shiny-border flex flex-row w-full p-2 rounded-md h-16 min-h-16 gap-2 bg-black/10 hover:bg-selected transition-colors duration-300 overflow-hidden"
			ref={ref}
			onPointerDown={() => {
				// open file
				open(result.path, false);
			}}>
			<div
				className="h-full aspect-square bg-white/25 rounded-xl flex justify-center items-center"
				title={extension + " file"}>
				<Icon size={36} absoluteStrokeWidth strokeWidth={2} fill="red" />
			</div>
			<div
				className="flex flex-col w-full h-auto text-wrap overflow-hidden"
				title={result.path}>
				<p className="text-primary text-nowrap fade-text-right">{fileName}</p>

				<div className="flex flex-row gap-2 pl-2 w-auto max-w-full ">
					<p className="text-secondary text-xs text-nowrap w-full fade-text-right">
						{filePath}
					</p>
				</div>
			</div>
		</div>
	);
};
