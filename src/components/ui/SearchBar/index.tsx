import "../../../styles/Theme.css";
import "../../../input.css";
import Panel from "../base/Panel.tsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { debug } from "@tauri-apps/plugin-log";
import { useOpenWindow } from "../../../hooks/useOpenWindow.tsx";
import { useSpecialCharacters } from "./SpecialCharacters.tsx";
import { useSearchStore } from "../../../hooks/search/useSearch.tsx";

const SearchBar = () => {
	const windowIsOpen = useOpenWindow();
	const [isSearching, setIsSearching] = useState(false);
	const searchTimeout = useRef<NodeJS.Timeout | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const searchHighlightRange = useRef<[number, number]>([0, 0]);
	const doUpdateSearchHighlightRange = useRef(true);

	const storeSearch = useSearchStore((state) => state.search);
	const storeResult = useSearchStore((state) => state.searchResults);
	const storeResultType = useSearchStore((state) => state.searchType);
	const storeSetIsSearching = useSearchStore((state) => state.setIsSearching);
	const inputRef = useRef<HTMLInputElement>(null);

	const fillText = useMemo(() => {
		if (searchQuery.trim() === "") {
			return "Search...";
		} else {
			if (storeResultType === "calculator") {
				let fill = searchQuery.replace(/^ /, "\u00A0");
				if (fill.endsWith("=")) {
					fill = fill.replace("=", "");
				}
				return fill + "  = " + storeResult;
			} else {
				return searchQuery.replace(/^ /, "\u00A0");
			}
		}
	}, [searchQuery, storeResultType, storeResult]);

	const specialCharacters = useSpecialCharacters({
		searchQuery,
		setSearchQuery,
		searchHighlightRange,
		doUpdateSearchHighlightRange,
	});

	const handleSearchTimeout = () => {
		if (searchTimeout.current) {
			clearTimeout(searchTimeout.current);
		}
		searchTimeout.current = setTimeout(() => {
			setIsSearching(true);
		}, 50);
	};

	function dispatchSearch() {
		if (!isSearching || !windowIsOpen) {
			return;
		}
		storeSearch(searchQuery);
		setIsSearching(false);
	}

	useEffect(() => {
		dispatchSearch();
	}, [searchQuery]);

	const overrideCtrlF = (event: KeyboardEvent) => {
		if (event.key === "f" && event.ctrlKey) {
			inputRef.current?.focus();
		}
	};

	const overrideRefresh = (event: KeyboardEvent) => {
		if (
			event.key === "F5" ||
			(event.ctrlKey && event.key === "r") ||
			(event.metaKey && event.key === "r")
		) {
			setIsSearching(true);
			dispatchSearch();
		}
	};

	useEffect(() => {
		if (windowIsOpen) {
			setSearchQuery("");
			inputRef.current?.setAttribute("value", "");
			inputRef.current?.focus();
		} else {
			setIsSearching(false);
			storeSetIsSearching(false);
			inputRef.current?.blur();
		}

		window.addEventListener("keydown", overrideCtrlF);
		window.addEventListener("keydown", overrideRefresh);
		return () => {
			window.removeEventListener("keydown", overrideCtrlF);
			window.removeEventListener("keydown", overrideRefresh);
		};
	}, [windowIsOpen]);

	const onKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Escape") {
				inputRef.current?.blur();
			}
			if (e.key === "Enter") {
				debug("Search Query: " + searchQuery);
				dispatchSearch();
				inputRef.current?.blur();
			}

			if (e.key in specialCharacters) {
				specialCharacters[e.key as keyof typeof specialCharacters]();
				doUpdateSearchHighlightRange.current = false;
				inputRef.current?.setSelectionRange(
					searchHighlightRange.current[0],
					searchHighlightRange.current[1],
					"forward"
				);
				e.preventDefault();
			}
		},
		[searchQuery]
	);

	const onChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (!inputRef.current) return;
			setSearchQuery(inputRef.current.value);
			handleSearchTimeout();
		},
		[searchQuery]
	);

	const onBlur = useCallback(() => {
		setIsSearching(false);
		storeSetIsSearching(false);
	}, []);

	const onFocus = useCallback(() => {
		setIsSearching(true);
		setTimeout(() => {
			setIsSearching(false);
		}, 500);
		storeSetIsSearching(true);
		inputRef.current?.select();
	}, []);

	const onSelection = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
		if (!doUpdateSearchHighlightRange.current) {
			doUpdateSearchHighlightRange.current = true;
			e.currentTarget.setSelectionRange(
				searchHighlightRange.current[0],
				searchHighlightRange.current[1]
			);
			return;
		}
		searchHighlightRange.current = [
			e.currentTarget.selectionStart || 0,
			e.currentTarget.selectionEnd || 0,
		];
	}, []);

	return (
		<Panel
			className={`h-12 border-2 focus-within:border-blue-400	 
				${isSearching ? "rainbow-border" : ""} 
				`}
			data-searching={isSearching}>
			<div className="absolute -z-10 top-0 left-0 p-2 w-full h-full  items-center flex">
				<p className="text-secondary px-1">{fillText}</p>
			</div>
			<input
				name="q"
				ref={inputRef}
				id={"search-input"}
				className="rounded-lg text-text p-2 bg-transparent w-full" // Ensure Tailwind CSS classes are applied
				type="search"
				value={searchQuery}
				onChange={onChange}
				onKeyDown={onKeyDown}
				onBlur={onBlur}
				onFocus={onFocus}
				onSelect={onSelection}
				autoComplete="off"
			/>
		</Panel>
	);
};

export default SearchBar;
