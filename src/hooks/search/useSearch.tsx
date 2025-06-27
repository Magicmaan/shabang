import { invoke, Channel } from '@tauri-apps/api/core'
import { debug, error } from '@tauri-apps/plugin-log'
import { create, StateCreator } from 'zustand'
import * as math from 'mathjs'
import { identifySearchType } from './searchType'
import {
    ApplicationData,
    ControlPanelData,
    EverythingError,
    EverythingData,
    searchResults,
    searchTypes,
} from '@/types/searchTypes'
import { openPath } from '@tauri-apps/plugin-opener'
import { listen } from '@tauri-apps/api/event'
import { getBang } from './Bangs'

import { search } from '@/backend/command'
import { getMath } from './math'

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
    addToHistory: (query: string, searchType: searchTypes) => void
    addLatestToHistory: () => void
}

export type SearchSlice = {
    search: State & Action
}

export const createSearchSlice: StateCreator<
    SearchSlice,
    [],
    [],
    SearchSlice
> = (set, get) => ({
    search: {
        searchQuery: '',
        previousQueries: [],
        previousSearchQuery: '',
        searchResults: { everything: [], controlpanel: [], application: [] },
        searchType: searchTypes.file,
        isSearching: false,
        searchHistory: [],

        search: async (_query: string) => {
            if (_query.trim() === '') {
                set((state) => ({
                    ...state,
                    search: {
                        ...state.search,
                        searchResults: new EverythingError(
                            'No query.',
                            'No query.'
                        ),
                        searchType: searchTypes.error,
                        isSearching: false,
                    },
                }))
                throw new EverythingError('No query.', 'No query.')
            }

            const results: searchResults = {
                everything: [],
                controlpanel: [],
                application: [],
                internet: undefined,
                bang: undefined,
            }

            set((state) => ({
                ...state,
                search: {
                    ...state.search,
                    searchResults: {
                        everything: [],
                        controlpanel: [],
                        application: [],
                    },
                },
            }))

            let query = _query
            let searchType = searchTypes.file
            // identify bangs

            const bangResult = getBang(_query)
            if (bangResult) {
                const b = bangResult[0]
                query = bangResult[1]
                searchType = b.searchType

                console.log('Bang found')
                // console.log(b)
                console.log('bang query', query)
                results.bang = b

                set((state) => ({
                    ...state,
                    search: {
                        ...state.search,
                        searchResults: {
                            ...state.search.searchResults,
                            bang: b,
                        },
                    },
                }))
            } else {
                // if no bangs found, search
                const { searchType: st, query: q } = identifySearchType(_query)
                searchType = st
                query = q
            }

            const mathResult = getMath(query)
            if (mathResult) {
                console.log('Math result found')
                results.calculator = mathResult
                set((state) => ({
                    ...state,
                    search: {
                        ...state.search,
                        searchResults: {
                            ...state.search.searchResults,
                            calculator: mathResult,
                        },
                    },
                }))
            }

            // add new query to store
            const oldQuery = get().search.searchQuery
            set((state) => ({
                search: {
                    ...state.search,
                    previousSearchQuery: oldQuery,
                    searchQuery: query,
                },
            }))
            set((state) => ({
                search: {
                    ...state.search,
                    searchType,
                },
            }))
            try {
                const res = await search({
                    query,
                    onStart: (event) => {
                        console.log('🟢 onStart callback fired:', event)
                        const curQ = get().search.searchQuery
                        console.log('searching ', event.data.query)
                        console.log('current query is', curQ)
                        set((state) => ({
                            search: {
                                ...state.search,
                                isSearching: true,
                            },
                        }))
                    },
                    onEverythingResult: (event) => {
                        console.log(
                            '🟢 onEverythingResult callback fired:',
                            event
                        )

                        // add result
                        results.everything = event.data.data
                        set((state) => ({
                            search: {
                                ...state.search,
                                searchResults: {
                                    ...state.search.searchResults,
                                    everything: event.data.data,
                                },
                            },
                        }))
                    },
                    onAppResult: (event) => {
                        console.log('🟢 onAppResult callback fired:', event)

                        results.application = event.data.data
                        set((state) => ({
                            search: {
                                ...state.search,
                                searchResults: {
                                    ...state.search.searchResults,
                                    application: event.data.data,
                                },
                            },
                        }))
                    },
                    onControlPanelResult: (event) => {
                        console.log(
                            '🟢 onControlPanelResult callback fired:',
                            event
                        )

                        results.controlpanel = event.data.data
                        set((state) => ({
                            search: {
                                ...state.search,
                                searchResults: {
                                    ...state.search.searchResults,
                                    controlpanel: event.data.data,
                                },
                            },
                        }))
                    },
                    onFinished: (event) => {
                        console.log('🟢 onFinished callback fired:', event)

                        set((state) => ({
                            search: {
                                ...state.search,
                                isSearching: false,
                            },
                        }))
                    },
                })
                console.log('✅ Search function completed, result:', res)

                if (!res) {
                    throw new EverythingError('No results.', 'No results found')
                }
                return res
            } catch (e: any) {
                console.error('Error searching', e)

                set((state) => ({
                    search: {
                        ...state.search,
                        isSearching: false,
                        searchType: searchTypes.error,
                    },
                }))
                throw e
            }
        },
        addToHistory: (query: string, searchType: searchTypes) => {
            // set((state) => ({
            //     previousQueries: [...state.previousQueries, { query, searchType }],
            // }))
            console.log('Adding to history')
        },
        addLatestToHistory: () => {
            const query = get().search.searchQuery
            const searchType = get().search.searchType
            set((state) => ({
                search: {
                    ...state.search,
                    previousQueries: [
                        ...state.search.previousQueries,
                        { query, searchType },
                    ],
                },
            }))
        },
    },
})
