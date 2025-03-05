import { debug } from "@tauri-apps/plugin-log";
import { useCallback } from "react";

interface UseSpecialCharactersProps {
	searchQuery: string;
	setSearchQuery: (query: string | ((prev: string) => string)) => void;
	searchHighlightRange: React.MutableRefObject<[number, number]>;
	doUpdateSearchHighlightRange: React.MutableRefObject<boolean>;
}

export const useSpecialCharacters = ({
	searchQuery,
	setSearchQuery,
	searchHighlightRange,
	doUpdateSearchHighlightRange,
}: UseSpecialCharactersProps) => {
	const getHighlightedText = useCallback(() => {
		return searchQuery.slice(
			searchHighlightRange.current[0],
			searchHighlightRange.current[1]
		);
	}, [searchQuery, searchHighlightRange]);

	const onParentheses = useCallback(() => {
		// so if parentheses etc are added, it will be added to the search query
		// bob -> (bob)
		debug("highlight range" + searchHighlightRange.current);
		const highlightedText = getHighlightedText();

		//if no text is highlighted, add parentheses around the cursor
		if (highlightedText === "") {
			setSearchQuery((prev) => {
				return (
					prev.slice(0, searchHighlightRange.current[0] - 1) +
					`()` +
					prev.slice(searchHighlightRange.current[0] - 1)
				);
			});

			doUpdateSearchHighlightRange.current = false;
			searchHighlightRange.current = [
				searchHighlightRange.current[0],
				searchHighlightRange.current[1],
			];
		} else {
			let highlightedText = getHighlightedText();
			setSearchQuery((prev) => {
				return prev.replace(highlightedText, `(${highlightedText})`);
			});
		}
	}, [searchQuery, searchHighlightRange]);

	const specialCharacters = {
		"(": onParentheses,
	};

	return specialCharacters;
};
