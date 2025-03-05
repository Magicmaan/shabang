import { debug } from '@tauri-apps/plugin-log'
import { useDebounce, useThrottle, useThrottleFn, useTimeout } from 'react-use'
import { useSearchStore } from '@/hooks/search/useSearch'
import Panel from '@/components/ui/base/Panel'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    AppResult,
    FileResult,
    PlaceHolderResult,
    SettingResult,
} from './Result'
import { CalculatorResult } from './CalculatorResult'
import SettingBar from './SettingBar'
import {
    TabContent,
    TabList,
    Tabs,
    TabTriggers,
} from '@/components/ui/base/Tabs'
import {
    ApplicationResult,
    ControlPanelResult,
    EverythingError,
    EverythingErrorName,
    EverythingResult,
    searchResults,
} from '@/types/searchTypes'
import { Frown } from 'lucide-react'
import { e } from 'mathjs'
import { listen } from '@tauri-apps/api/event'

const ResultsPlaceholder = ({ active }: { active: boolean }) => {
    return (
        <div
            aria-hidden={!active}
            aria-disabled={!active}
            className={`scrollbar group bg-primary border-primary absolute z-10 h-auto w-full overflow-y-scroll pb-2 transition-all duration-500 ease-in-out aria-hidden:pointer-events-none aria-hidden:opacity-0`}
        >
            <ul>
                {[...Array(5)].map((_, i) => {
                    return (
                        <li key={i}>
                            <PlaceHolderResult key={i} />
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

const ResultsError = ({ error }: { error: EverythingError }) => {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2">
            <Frown size={64} />
            <h1 className="text-text text-xl">{error.name}</h1>
            <p className="text-text">{error.message}</p>
        </div>
    )
}

const ResultsContainer = () => {
    const ref = useRef<HTMLDivElement>(null)
    const [isError, setIsError] = useState(false)
    const error = useRef<EverythingError | Error | null>(null)

    const EventTimeout = useRef<any>(null)
    const isSearching = useSearchStore((state) => state.isSearching)

    useEffect(() => {
        if (isSearching) {
            debug('Searching results')
        } else {
            debug('Not Searching results')
        }
    }, [isSearching])

    let searchResult = useSearchStore((state) => state.searchResults)
    // if error, return error component
    useEffect(() => {
        if (searchResult instanceof EverythingError) {
            setIsError(true)
            debug('error from result ' + searchResult.name)
            error.current = searchResult
            searchResult = { everything: [], controlpanel: [], application: [] }
        } else {
            setIsError(false)
        }
    }, [searchResult])

    // if no error carry on
    const results = useMemo(() => {
        if (searchResult instanceof EverythingError) {
            return { everything: [], controlpanel: [], application: [] }
        } else {
            return searchResult
        }
    }, [searchResult])
    const resultType = useSearchStore((state) => state.searchType)
    const resultsAmounts = useMemo(() => {
        return {
            all:
                (results.everything?.length || 0) +
                (results.controlpanel?.length || 0) +
                (results.application?.length || 0),
            files: results.everything?.length,
            settings: results.controlpanel?.length,
            apps: results.application?.length,
        }
    }, [results])

    const [selectedKey, setSelectedKey] = useState<number | null>(10)
    const listRef = useRef<HTMLUListElement>(null)
    useEffect(() => {
        if (listRef.current) {
            const children = listRef.current.children
            if (children.length > 0) {
                const firstChild = children[0] as HTMLElement
                firstChild.focus()
            }
        }
    }, [listRef.current, results])

    const formattedResults = useMemo(() => {
        if (results instanceof EverythingError) {
            return
        }
        return {
            files: results.everything?.map((search: EverythingResult, i) => {
                return (
                    <li key={i}>
                        <FileResult result={search} key={i} selected={i} />
                    </li>
                )
            }),

            apps: results.application?.map((search: ApplicationResult, i) => {
                return (
                    <li key={i + (resultsAmounts.files || 0)}>
                        <AppResult
                            result={search}
                            key={i + (resultsAmounts.files || 0)}
                            selected={selectedKey || 0}
                        />
                    </li>
                )
            }),
            settings: results.controlpanel?.map(
                (search: ControlPanelResult, i) => {
                    return (
                        <li
                            key={
                                i +
                                (resultsAmounts.files || 0) +
                                (resultsAmounts.apps || 0)
                            }
                        >
                            <SettingResult
                                result={search}
                                key={
                                    i +
                                    (resultsAmounts.files || 0) +
                                    (resultsAmounts.apps || 0)
                                }
                                selected={selectedKey || 0}
                            />
                        </li>
                    )
                }
            ),
        }
    }, [results])

    const mergedFormattedResults = useMemo(() => {
        return [
            ...(formattedResults.settings || []),
            ...(formattedResults.apps || []),
            ...(formattedResults.files || []),
        ]
    }, [formattedResults])

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                if (listRef.current) {
                }
            }
            if (e.key === 'ArrowUp') {
                debug('ArrowUp')
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => {
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [])

    // if error or searching -> 32
    // if results < 4 -> 48
    // if results < 6 -> 64
    // if results > 6 -> 96
    const maxHeight = useMemo(() => {
        if (isError) {
            return 'max-h-64 min-h-64'
        }

        if (isSearching) {
            return 'max-h-48 min-h-48'
        } else {
            if (mergedFormattedResults.length < 4) {
                return 'max-h-48 min-h-48'
            } else if (mergedFormattedResults.length < 6) {
                return 'max-h-64 min-h-64'
            } else {
                return 'max-h-96 min-h-96'
            }
        }
    }, [isSearching, mergedFormattedResults, isError])

    return (
        <Panel
            ref={ref}
            data-error={isError}
            className={`flex ${maxHeight} transition-height h-auto w-auto flex-col gap-1 overflow-hidden transition-all duration-500 ease-in-out`}
        >
            {/* <SettingBar /> */}

            <Tabs defaultValue="*" className="h-full w-full overflow-hidden">
                <TabList>
                    <TabTriggers value="*">
                        <p className="text-text">*</p>

                        <div className="center mr-1 aspect-square h-9/10 rounded-full bg-white/10 text-xs">
                            {resultsAmounts.all}
                        </div>
                    </TabTriggers>
                    <TabTriggers value="files">
                        <p className="text-text">Files</p>

                        <div className="center mr-1 aspect-square h-9/10 rounded-full bg-white/10 text-xs">
                            {resultsAmounts.files}
                        </div>
                    </TabTriggers>
                    <TabTriggers value="apps">
                        <p className="text-text">Apps</p>

                        <div className="center mr-1 aspect-square h-9/10 rounded-full bg-white/10 text-xs">
                            {resultsAmounts.apps}
                        </div>
                    </TabTriggers>
                    <TabTriggers value="settings">
                        <p className="text-text">Settings</p>

                        <div className="center mr-1 aspect-square h-9/10 rounded-full bg-white/10 text-xs">
                            {resultsAmounts.settings}
                        </div>
                    </TabTriggers>
                </TabList>
                <TabContent value="*">
                    {isError && !isSearching ? (
                        <ResultsError
                            error={error.current as EverythingError}
                        />
                    ) : null}
                    <ResultsPlaceholder active={isSearching} />
                    <ul
                        ref={listRef}
                        aria-hidden={isSearching}
                        aria-disabled={isSearching}
                        className={`h-auto transition-all duration-500 ease-in-out aria-hidden:opacity-0`}
                    >
                        {mergedFormattedResults}
                    </ul>
                </TabContent>
                <TabContent value="files">{formattedResults.files}</TabContent>
                <TabContent value="apps">{formattedResults.apps}</TabContent>
                <TabContent value="settings">
                    {formattedResults.settings}
                </TabContent>
            </Tabs>
        </Panel>
    )
}

export default ResultsContainer
