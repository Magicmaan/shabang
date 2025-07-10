import '../../../styles/Theme.css'
import '../../../input.css'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { debug } from '@tauri-apps/plugin-log'
import { useOpenWindow } from '../../../hooks/useOpenWindow.tsx'

import { searchResults } from '@/types/searchTypes'
import { useAppStore } from '@/hooks/useApp.tsx'
import { useDebounce, useThrottle, useTimeout } from 'react-use'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils.ts'
import {
    SearchField,
    Label,
    Input,
    Button,
    TagGroup,
    TagList,
    Tag,
} from 'react-aria-components'
import '../../../styles/SearchBar.css'
import Tags from '../base/Tags.tsx'

const SearchBarStyles = cva('h-12 border-2', {
    variants: {
        variant: {
            default: 'border-2',
            small: 'border-0',
            large: 'border-4',
        },

        borderBottom: {
            true: 'border-b-2',
            false: 'border-b-none',
        },
        borderTop: {
            true: 'border-t-2',
            false: 'border-t-none',
        },
    },
    defaultVariants: {
        variant: 'default',
        borderBottom: true,
        borderTop: true,
    },
})

interface SearchBarProps {
    borderBottom?: boolean
    borderTop?: boolean
    variant?: 'default' | 'small' | 'large'
    className?: string
}

const SearchBar = ({ className }: SearchBarProps) => {
    //TODO:
    // - add a search history
    // - add a search type selector
    //   display search tags properly
    // cleanup and seperate code

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
            event.preventDefault()
            event.stopPropagation()
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
            event.preventDefault()
            event.stopPropagation()
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
        },
        [searchQuery, searchResults, storeQuery]
    )

    const onChange = useCallback(() => {
        if (!inputRef.current) return
        setSearchQuery(inputRef.current.value)
        setIsSearching(true)
        // handleSearchTimeout()
    }, [searchQuery])

    return (
        <div
            className="flex w-full flex-row justify-between gap-2"
            style={{ gridArea: 'search' }}
        >
            <div className={cn('search-field-container border', className)}>
                <SearchField
                    aria-label="Search"
                    className={'aria-search-field'}
                >
                    <Tags />
                    <Input
                        ref={inputRef}
                        placeholder={fillText}
                        value={searchQuery}
                        onChange={onChange}
                        onKeyDown={onKeyDown}
                    />

                    <Button>✕</Button>
                </SearchField>
            </div>
            <div className="bg-gradient aspect-square h-full rounded-full border">
                <Button className="h-full w-full rounded-full"></Button>
            </div>
        </div>
    )
}

export default SearchBar
