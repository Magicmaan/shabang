import { EllipsisVertical } from "lucide-react";
import React from "react";
import { useSearchStore } from "../../../hooks/search/useSearch";
import { debug } from "@tauri-apps/plugin-log";

import { toRelativeStr } from "../../../util/time";

interface PreviousEquationProps {
	query: string;
}

const PreviousEquation: React.FC<PreviousEquationProps> = ({ query }) => {
	const timestamp = new Date(1740689723000); // Mock value for testing

	const relativeTime = toRelativeStr(timestamp);
	const date = timestamp.toUTCString();

	return (
		<div className="w-full h-12 flex flex-row p-2 justify-between items-start bg-secondary previous-equation rounded-md">
			<div className="w-auto h-full flex flex-row gap-1 justify-center items-center bg-red-500">
				<p className="w-full h-full text-text center">{query}</p>
			</div>

			<p title={date} className="text-text text-sm">
				{relativeTime}
			</p>
			<div className="aspect-square w-5 flex justify-center items-center">
				<EllipsisVertical />
			</div>
		</div>
	);
};

export const CalculatorResult = () => {
	const previousQueries = useSearchStore((state) => state.previousQueries)
		.filter((query) => query.searchType === "calculator")
		.map((query) => query.query);

	// useEffect(() => {
	// 	//debug("search difference: " + searchDifference);
	// }, [searchQuery]);
	// debug("Results: " + results[0].query + " with type " + resultType);

	debug("Previous Queries: " + previousQueries);
	return (
		<div className="w-full min-h-64 flex flex-col gap-1 items-start justify-start p-1 equation-list">
			{previousQueries.map((query, index) => (
				<PreviousEquation query={query} key={index} />
			))}
			<PreviousEquation query={"51 + 9 = 60"} />
			<PreviousEquation query={"21 / 2 = 60"} />
			<PreviousEquation query={"21 / 2 = 60"} />
		</div>
	);
};
