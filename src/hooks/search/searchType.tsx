import * as math from "mathjs";
import { searchTypes } from "../../types/searchTypes";

const shortcuts: { [key: string]: string } = {
	"!c": searchTypes.calculator,
	"!f": searchTypes.file,
	"!s": searchTypes.search,
};

const isValidMath = (query: string): boolean => {
	try {
		// eslint-disable-next-line no-eval
		var result = math.evaluate(query);
		if (
			result === undefined ||
			result === null ||
			isNaN(result) ||
			!isFinite(result) ||
			result === ""
		) {
			return false;
		}
		return true;
	} catch (e) {
		return false;
	}
};

export const getSearchType = (
	query: string
): { searchType: searchTypes; query: string } => {
	const shortcut = query.slice(0, 2);
	let searchType: searchTypes | undefined;
	let modifiedQuery = query;

	if (shortcuts[shortcut]) {
		searchType = shortcuts[shortcut] as searchTypes;
		modifiedQuery = query.substring(shortcut.length).trim();
	}

	if (!searchType) {
		if (isValidMath(query)) {
			searchType = searchTypes.calculator;
		} else {
			if (
				query.endsWith("+") ||
				query.endsWith("-") ||
				query.endsWith("*") ||
				query.endsWith("/") ||
				query.endsWith("=")
			) {
				searchType = searchTypes.calculator;
			} else {
				searchType = searchTypes.file;
			}
		}
	}

	return { searchType, query: modifiedQuery };
};
