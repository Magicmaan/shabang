import { debug } from "@tauri-apps/plugin-log";
import { useSearchStore } from "../../../hooks/search/useSearch";
import "../../../styles/Theme.css";
import Panel from "../base/Panel";
import { useCallback, useMemo } from "react";
import { FileResult } from "./FileResult";
import { CalculatorResult } from "./CalculatorResult";

const ResultsContainer = () => {
	const results = useSearchStore((state) => state.searchResults);
	const resultType = useSearchStore((state) => state.searchType);
	const formattedResults = useMemo(() => {
		if (resultType === "file") {
			return results.map((r: string) => {
				const filename =
					r.substring(r.lastIndexOf("\\") + 1) || r.substring(r.lastIndexOf("/") + 1);
				let result = {
					name: filename,
					path: r,
				};
				return <FileResult result={result} />;
			});
		} else {
			return (
				<div className="flex flex-col min-w-full min-h-64 bg-green-300 justify-center items-center p-1">
					<CalculatorResult />
				</div>
			);
		}
	}, [results, resultType]);
	debug("Results: " + results);

	const onKeyDown = useCallback((e: React.KeyboardEvent) => {
		if (e.key === "ArrowDown") {
			debug("ArrowDown");
		}
		if (e.key === "ArrowUp") {
			debug("ArrowUp");
		}
	}, []);

	return (
		<Panel
			className="h-full max-h-96 min-h-64 overflow-scroll rainbow-border flex flex-col w-auto gap-1 overflow-x-hidden"
			onKeyDown={onKeyDown}>
			{formattedResults}
		</Panel>
	);
};

export default ResultsContainer;
