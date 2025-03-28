import '../../../styles/Theme.css'
import '../../../input.css'
import Panel from '../base/Panel.tsx'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { debug } from '@tauri-apps/plugin-log'
import { useOpenWindow } from '../../../hooks/useOpenWindow.tsx'
import { useSpecialCharacters } from './SpecialCharacters.tsx'
import { createSearchSlice } from '../../../hooks/search/useSearch.tsx'
import {
    ApplicationData,
    ControlPanelData,
    EverythingError,
    EverythingData,
    searchResults,
    searchTypes,
} from '@/types/searchTypes'
import { useAppStore } from '@/hooks/useApp.tsx'
import { useDebounce, useThrottle, useTimeout } from 'react-use'

const SearchBar = () => {
    const { windowOpenState } = useOpenWindow()
    const [isSearching, setIsSearching] = useState(false)
    const [debounceSearch, setDebounceSearch] = useState(false)

    const [, cancel] = useDebounce(
        () => {
            setDebounceSearch(isSearching)
        },
        100,
        [isSearching]
    )
    const [searchQuery, setSearchQuery] = useState('')
    // use a throttled query to reduce number of requests to server
    const throttledQuery = useThrottle(searchQuery, 200)

    // on throttle query change, dispatch a search
    // searching can also be triggered by the search bar itself (enter, confirm etc)
    useEffect(() => {
        dispatchSearch(throttledQuery)
    }, [throttledQuery])

    const searchHighlightRange = useRef<[number, number]>([0, 0])
    const doUpdateSearchHighlightRange = useRef(true)

    const storeSearch = useAppStore((state) => state.search.search)
    const storeQuery = useAppStore((state) => state.search.searchQuery)
    const searchResults = useAppStore((state) => state.search.searchResults)
    const searchType = useAppStore((state) => state.search.searchType)
    const addToHistory = useAppStore((state) => state.search.addToHistory)
    const inputRef = useRef<HTMLInputElement>(null)

    const fillText = useMemo(() => {
        let fill = searchQuery.replace(/^ /, '\u00A0') + ' '
        if (searchQuery.trim() === '') {
            return 'Search...'
        } else {
            const result = searchResults as searchResults

            if (result.bang) {
                // console.log('filling bang', result.bang)
                return fill + result.bang.description
            }

            if (searchType === 'calculator' && result.calculator) {
                let fill = searchQuery.replace(/^ /, '\u00A0')
                if (fill.endsWith('=')) {
                    fill = fill.replace('=', '')
                }
                return fill + ' = ' + result.calculator.result
            } else {
                return searchQuery.replace(/^ /, '\u00A0')
            }
        }
    }, [searchQuery, searchType, searchResults])

    const specialCharacters = useSpecialCharacters({
        searchQuery,
        setSearchQuery,
        searchHighlightRange,
        doUpdateSearchHighlightRange,
    })

    function dispatchSearch(query: string) {
        if (!debounceSearch) return
        storeSearch(query)
            .then((results) => {
                debug('file results count:' + results.everything?.length)
                debug(
                    'controlpanel results count:' + results.controlpanel?.length
                )

                addToHistory(query, searchType)
                setTimeout(() => {
                    setIsSearching(false)
                }, 5000)
            })
            .catch((e) => {
                debug('error from search ' + e.name)
                addToHistory(query, searchType)
                setIsSearching(false)
            })
    }

    const overrideCtrlF = (event: KeyboardEvent) => {
        if (event.key === 'f' && event.ctrlKey) {
            inputRef.current?.focus()
        }
    }

    const overrideRefresh = (event: KeyboardEvent) => {
        if (
            event.key === 'F5' ||
            (event.ctrlKey && event.key === 'r') ||
            (event.metaKey && event.key === 'r')
        ) {
            setIsSearching(true)
            dispatchSearch(searchQuery)
        }
    }

    useEffect(() => {
        if (windowOpenState === 'open') {
            inputRef.current?.focus()
        } else {
            setSearchQuery('')
            setIsSearching(false)
            searchHighlightRange.current = [0, 0]
            inputRef.current?.setAttribute('value', '')
            inputRef.current?.blur()
        }

        window.addEventListener('keydown', overrideCtrlF)
        window.addEventListener('keydown', overrideRefresh)
        return () => {
            window.removeEventListener('keydown', overrideCtrlF)
            window.removeEventListener('keydown', overrideRefresh)
        }
    }, [windowOpenState])

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Escape') {
                inputRef.current?.blur()
            }

            if (e.key === 'Enter') {
                console.log('searching action')
                if (searchResults) {
                    const result = searchResults as searchResults
                    setIsSearching(false)
                    // check if bang is present in search results
                    if (result.bang?.action) {
                        console.log('dispatching bang action')
                        console.log(storeQuery)
                        result.bang.action()
                    }
                    return
                }
                // debug("Search Query: " + searchQuery);
                dispatchSearch(searchQuery)
                inputRef.current?.blur()
            }

            // prevent arrow key movement as used for results
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault()
            }

            if (e.key in specialCharacters) {
                specialCharacters[e.key as keyof typeof specialCharacters]()
                doUpdateSearchHighlightRange.current = false
                inputRef.current?.setSelectionRange(
                    searchHighlightRange.current[0],
                    searchHighlightRange.current[1],
                    'forward'
                )
                e.preventDefault()
            }
        },
        [searchQuery, searchResults, storeQuery]
    )

    const onChange = useCallback(() => {
        if (!inputRef.current) return
        setSearchQuery(inputRef.current.value)
        setIsSearching(true)
        // handleSearchTimeout()
    }, [searchQuery])

    const onBlur = useCallback(() => {
        addToHistory(searchQuery, searchType)

        setIsSearching(false)
    }, [])

    const onFocus = useCallback(() => {
        setIsSearching(true)
        setTimeout(() => {
            setIsSearching(false)
        }, 500)
        inputRef.current?.select()
    }, [])

    const onSelection = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        if (!doUpdateSearchHighlightRange.current) {
            doUpdateSearchHighlightRange.current = true
            e.currentTarget.setSelectionRange(
                searchHighlightRange.current[0],
                searchHighlightRange.current[1]
            )
            return
        }
        searchHighlightRange.current = [
            e.currentTarget.selectionStart || 0,
            e.currentTarget.selectionEnd || 0,
        ]
    }, [])

    return (
        <Panel
            className={`h-12 border-2 ${isSearching ? 'rainbow-border' : ''} `}
            data-searching={isSearching}
        >
            <div className="absolute top-0 left-0 -z-10 flex h-full w-full items-center p-2">
                <p className="text-secondary px-1 whitespace-nowrap">
                    {fillText}
                </p>
            </div>
            <input
                name="search"
                ref={inputRef}
                id={'search-input'}
                className="text-text w-full rounded-lg border-0 bg-transparent p-2 outline-0" // Ensure Tailwind CSS classes are applied
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
    )
}

export default SearchBar
