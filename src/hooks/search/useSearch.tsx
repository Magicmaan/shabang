import { invoke, Channel } from '@tauri-apps/api/core'
import { debug, error } from '@tauri-apps/plugin-log'
import { create, StateCreator } from 'zustand'
import * as math from 'mathjs'
import { getSearchType } from './searchType'
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

            // console.log('query before bang', query)

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
                const { searchType: st, query: q } = getSearchType(_query)
                searchType = st
                query = q
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

            // console.log('Searching for ' + query + ' with type ' + searchType)

            set((state) => ({
                search: {
                    ...state.search,
                    searchType,
                },
            }))
            search({
                query,
                onStart: (event) => {
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
                    // debug('Got everything results')
                    // console.log(event)

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
                    // debug('Got application results')
                    // console.log(event)

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
                    // debug('Got control panel results')
                    // console.log(event)

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
                    // debug('Finished searching')

                    set((state) => ({
                        search: {
                            ...state.search,
                            isSearching: false,
                        },
                    }))
                },
            }).catch((e: EverythingError) => {
                console.error('Error searching', e)

                set((state) => ({
                    search: {
                        ...state.search,
                        isSearching: false,
                        searchType: searchTypes.error,
                        // searchResults: e,
                    },
                }))
            })
            return results
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
