import { invoke } from "@tauri-apps/api/core";
import { debug } from "@tauri-apps/plugin-log";
import { create } from "zustand";
import * as math from "mathjs";
import { getSearchType } from "./searchType";
import { searchTypes } from "../../types/searchTypes";

type State = {
	searchQuery: string;
	previousSearchQuery: string;
	searchResults: any;
	searchType: searchTypes;
	isSearching: boolean;
};
type Action = {
	search: (query: string) => void;
	setIsSearching: (isSearching: boolean) => void;
	openFile: (path: string, useExplorer: boolean) => void;
};

const searchEverything = async (query: string) => {
	const results = await invoke("search_everything_js", { query: query });
	return results;
};
const searchMath = async (query: string) => {
	var results = math.evaluate(query);
	if (
		results === undefined ||
		results === null ||
		isNaN(results) ||
		!isFinite(results) ||
		results === ""
	) {
		results = "Invalid Equation";
	}
	return results;
};

const formatInputSearch = (query_: string) => {
	const trimmed = query_.trim();
	trimmed.replace("÷", "/");
	trimmed.replace("×", "*");
	const { searchType, query } = getSearchType(trimmed);

	return { searchType, query };
};

export const useSearchStore = create<State & Action>((set) => ({
	searchQuery: "",
	previousSearchQuery: "",
	searchResults: [],
	searchType: searchTypes.file,
	isSearching: false,

	search: async (_query: string) => {
		const { searchType, query } = formatInputSearch(_query);
		const oldQuery = useSearchStore.getState().searchQuery;
		set({ previousSearchQuery: oldQuery });
		set({ searchQuery: query });

		// const searchType = isValidEquation(query) ? "calculator" : "file";
		debug("Searching for " + query + " with type " + searchType);

		const results =
			searchType === "file" ? await searchEverything(query) : await searchMath(query);

		debug("Results: " + results + " with type " + searchType + " and " + typeof results);
		//const results = await invoke("search_everything_js", { query: query });
		set({ searchResults: results });
		set({ searchType });
	},
	setIsSearching: (isSearching: boolean) => {
		debug("Setting isSearching to " + isSearching);
		if (isSearching) {
			document.getElementById("search-input")?.focus();
		} else {
			document.getElementById("search-input")?.blur();
		}

		set({ isSearching });
	},
	openFile: async (path: string, useExplorer: boolean) => {
		await invoke("open_link_js", { link: path });
	},
}));
