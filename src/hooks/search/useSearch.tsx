import { invoke } from '@tauri-apps/api/core'
import { debug, error } from '@tauri-apps/plugin-log'
import { create } from 'zustand'
import * as math from 'mathjs'
import { getSearchType } from './searchType'
import {
    EverythingError,
    searchResults,
    searchTypes,
} from '../../types/searchTypes'
import { openPath } from '@tauri-apps/plugin-opener'
import { listen } from '@tauri-apps/api/event'

type State = {
    searchQuery: string
    previousSearchQuery: string
    searchResults: searchResults | EverythingError
    searchType: searchTypes
    isSearching: boolean
    previousQueries: { query: string; searchType: searchTypes }[]
}
type Action = {
    search: (query: string) => Promise<searchResults>
    openFile: (path: string, useExplorer: boolean) => void
    addToHistory: (query: string, searchType: searchTypes) => void
    addLatestToHistory: () => void
}

const searchMath = async (query: string) => {
    var results = math.evaluate(query)
    if (
        results === undefined ||
        results === null ||
        isNaN(results) ||
        !isFinite(results) ||
        results === ''
    ) {
        results = 'Invalid Equation'
    }
    return results
}

const search = async (query: string): Promise<searchResults> => {
    const results = invoke('search_js', { query })
        .then((res) => {
            if (!res) {
                throw new EverythingError('No results.', 'No results found')
            }
            return res as searchResults
        })
        .catch((e) => {
            throw new EverythingError(e, 'Error searching.')
        })
    debug('Results type: ' + typeof results)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return results
}

const formatInputSearch = (query_: string) => {
    const trimmed = query_.trim()
    trimmed.replace('÷', '/')
    trimmed.replace('×', '*')
    const { searchType, query } = getSearchType(trimmed)

    return { searchType, query }
}
interface SearchingProgress {
    time: number
}
export const useSearchStore = create<State & Action>((set) => ({
    searchQuery: '',
    previousQueries: [],
    previousSearchQuery: '',
    searchResults: { everything: [], controlpanel: [], application: [] },
    searchType: searchTypes.file,
    isSearching: false,
    searchHistory: [],

    search: async (_query: string) => {
        const { searchType, query } = formatInputSearch(_query)
        const oldQuery = useSearchStore.getState().searchQuery
        set({ previousSearchQuery: oldQuery })
        set({ searchQuery: query })

        debug('Searching for ' + query + ' with type ' + searchType)

        const isSearching = listen<SearchingProgress>('searching', (event) => {
            set({ isSearching: true })
        })

        const result = search(query)
            .then((results) => {
                // await new Promise((resolve) => setTimeout(resolve, 2000))
                debug('file results count:' + results.everything?.length)
                debug(
                    'controlpanel results count:' + results.controlpanel?.length
                )

                set({ searchResults: results })
                set({ searchType })
                set({ isSearching: false })
                return results
            })
            .catch((e: EverythingError) => {
                error(e.name + ' ' + e.message)
                set({ searchResults: e })
                set({ searchType: searchTypes.error })
                set({ isSearching: false })
                throw e
            })
        // remove listener
        isSearching.then((e) => e())
        return result
    },
    addToHistory: (query: string, searchType: searchTypes) => {
        set((state) => ({
            previousQueries: [...state.previousQueries, { query, searchType }],
        }))
    },
    addLatestToHistory: () => {
        const query = useSearchStore.getState().searchQuery
        const searchType = useSearchStore.getState().searchType
        set((state) => ({
            previousQueries: [...state.previousQueries, { query, searchType }],
        }))
    },
    openFile: async (path: string) => {
        debug('Opening file: ' + path)

        await invoke('open_link_js', { link: path })
    },
}))
