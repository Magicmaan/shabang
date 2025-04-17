import { debug } from '@tauri-apps/plugin-log'
import { useDebounce, useThrottle, useThrottleFn, useTimeout } from 'react-use'
import { createSearchSlice } from '@/hooks/search/useSearch'
import Panel from '@/components/ui/base/Panel'
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import {
    AppResult,
    BangResult,
    FileResult,
    PlaceHolderResult,
    ResultsError,
    ResultsPlaceholder,
    SettingResult,
} from './Result'
import { CalculatorResult } from './CalculatorResult'
import SettingBar from '../SettingBar'
import {
    TabContent,
    TabList,
    Tabs,
    TabTriggers,
} from '@/components/ui/base/Tabs'
import {
    ApplicationData,
    ControlPanelData,
    EverythingError,
    EverythingErrorName,
    EverythingData,
    searchResults,
} from '@/types/searchTypes'
import { ChevronDown, Frown, Info } from 'lucide-react'
import { e } from 'mathjs'
import { listen } from '@tauri-apps/api/event'
import { ContextMenu, ContextMenuProvider } from './ContextMenu'
import { useAppStore } from '@/hooks/useApp'
import DropSelector from '../base/DropSelector'
import Button from '../base/button'
import Divider from '../base/divider'

import { gsap } from 'gsap'
import ScrollList from '../base/ScrollList'

import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const ResultsStyle = cva(
    `transition-height flex h-auto max-h-full w-auto flex-col gap-1 overflow-hidden transition-all duration-500 ease-in-out`,
    {
        variants: {
            error: {
                true: 'bg-red-500',
                false: '',
            },

            gap: {
                true: 'gap-2',
                false: 'gap-0', // TODO
            },
        },
        defaultVariants: {
            error: false,
            gap: true,
        },
    }
)

const ResultsContainer = () => {
    const ref = useRef<HTMLDivElement>(null)
    const [isError, setIsError] = useState(false)
    const error = useRef<EverythingError | Error | null>(null)
    const isSearching = useAppStore((state) => state.search.isSearching)

    let searchType = useAppStore((state) => state.search.searchType)
    let searchResult = useAppStore((state) => state.search.searchResults)

    const [currentTab, setCurrentTab] = useState<
        '*' | 'files' | 'apps' | 'settings' | 'calculator'
    >('*')

    const [selectedKey, setSelectedKey] = useState<number | null>(null)
    const listRef = useRef<HTMLUListElement>(null)

    const [showSearchSettings, setShowSearchSettings] = useState(false)

    // if no error carry on
    const results = searchResult as searchResults
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

    // set selected to none on results refresh
    useEffect(() => {
        setSelectedKey(null)
    }, [results])

    console.log('results: ', results)
    const formattedResults = useMemo(() => {
        return {
            everything: results.everything?.map((search: EverythingData, i) => {
                return (
                    <li index={i}>
                        <FileResult result={search} index={i} selected={i} />
                    </li>
                )
            }),

            application: results.application?.map(
                (search: ApplicationData, i) => {
                    return (
                        <li index={i + (resultsAmounts.files || 0)}>
                            <AppResult
                                result={search}
                                index={i + (resultsAmounts.files || 0)}
                                selected={selectedKey || 0}
                            />
                        </li>
                    )
                }
            ),
            controlPanel: results.controlpanel?.map(
                (search: ControlPanelData, index) => {
                    debug('index: ' + index)
                    const i = index
                    return (
                        <li
                            index={
                                i +
                                (resultsAmounts.files || 0) +
                                (resultsAmounts.apps || 0)
                            }
                        >
                            <SettingResult
                                result={search}
                                selected={selectedKey || 0}
                                index={
                                    i +
                                    (results.everything?.length || 0) +
                                    (results.application?.length || 0)
                                } // Pass the index here
                            />
                        </li>
                    )
                }
            ),
            bang: results.bang ? (
                <li index={null}>
                    <BangResult bang={results.bang} index={0} selected={-1} />
                </li>
            ) : null,
        }
    }, [results])

    const mergedFormattedResults = useMemo(() => {
        if (results instanceof EverythingError) {
            return
        }

        let i = 0
        return [
            results.controlpanel?.map((search: ControlPanelData) => {
                return (
                    <li index={i++}>
                        <SettingResult
                            result={search}
                            selected={selectedKey || 0}
                            index={i}
                        />
                    </li>
                )
            }),
            results.application?.map((search: ApplicationData) => {
                return (
                    <li index={i++}>
                        <AppResult
                            result={search}
                            index={i}
                            selected={selectedKey || 0}
                        />
                    </li>
                )
            }),
            results.everything?.map((search: EverythingData) => {
                return (
                    <li index={i++}>
                        <FileResult
                            result={search}
                            index={i}
                            selected={selectedKey || 0}
                        />
                    </li>
                )
            }),
        ].flat()
    }, [results, selectedKey])

    // animation
    useLayoutEffect(() => {
        const list = listRef

        const tl = gsap.timeline()
        if (list.current) {
            for (let i = 0; i < 10; i++) {
                if (list.current.children[i]) {
                    tl.fromTo(
                        list.current.children[i],
                        {
                            opacity: 0,
                            transform: 'translateY(-25%)',
                            scale: 0.98,
                        },
                        {
                            opacity: 1,
                            transform: 'translateY(0%)',
                            scale: 1,
                            duration: 0.25,
                            ease: 'power2.inOut',
                        },
                        i * 0.05
                    )
                }
            }
        }
        return () => {
            tl.pause()
            tl.kill()
        }
    }, [results])

    const bang = results.bang

    // get height of search results
    // depends on the amount of results
    const maxHeight = useMemo(() => {
        if (currentTab === 'calculator') {
            return 'max-h-96 h-auto min-h-48'
        }

        if (!mergedFormattedResults) {
            return 'max-h-48 h-48 min-h-48'
        }

        if (isError) {
            return 'min-h-64 h-64 max-h-64'
        }

        if (isSearching) {
            return 'max-h-48 h-48 min-h-48'
        } else {
            if (mergedFormattedResults.length < 6) {
                return 'max-h-64 h-64 min-h-64'
            } else {
                return 'max-h-96 h-96 min-h-96'
            }
        }
    }, [isSearching, mergedFormattedResults, isError, currentTab])

    return (
        <Panel
            ref={ref}
            data-error={isError}
            className={ResultsStyle({ error: isError, gap: true })}
        >
            <ContextMenuProvider>
                <Tabs
                    defaultValue="*"
                    className="h-full w-full overflow-hidden"
                    onValueChange={(value) => {
                        setCurrentTab(value as any)
                        console.log('currentTab: ', currentTab)
                        setSelectedKey(null)
                    }}
                >
                    <TabList>
                        <TabTriggers value="*">
                            <p className="text-text">*</p>

                            <div className="center aspect-square h-9/10 rounded-full bg-black/10 text-xs dark:bg-white/10">
                                {resultsAmounts.all}
                            </div>
                        </TabTriggers>
                        <TabTriggers value="files">
                            <p className="text-text">Files</p>

                            <div className="center aspect-square h-9/10 rounded-full bg-black/10 text-xs dark:bg-white/10">
                                {resultsAmounts.files}
                            </div>
                        </TabTriggers>
                        <TabTriggers value="apps">
                            <p className="text-text">Apps</p>

                            <div className="center aspect-square h-9/10 rounded-full bg-black/10 text-xs dark:bg-white/10">
                                {resultsAmounts.apps}
                            </div>
                            <ContextMenu title="Apps" />
                        </TabTriggers>
                        <TabTriggers value="settings">
                            <p className="text-text">Settings</p>

                            <div className="center aspect-square h-9/10 rounded-full bg-black/10 text-xs dark:bg-white/10">
                                {resultsAmounts.settings}
                            </div>
                            <ContextMenu title="Settings" />
                        </TabTriggers>
                        <TabTriggers value="calculator">
                            <p className="text-text">Calculator</p>

                            <ContextMenu title="Calculator" />
                        </TabTriggers>

                        <div className="flex w-full justify-end" />
                        <Button
                            shape="circle"
                            size="small"
                            border="none"
                            id="search-settings-button"
                            onClick={() =>
                                setShowSearchSettings(!showSearchSettings)
                            }
                        >
                            <div className="flex h-6 w-6 items-center justify-center rounded-full">
                                <div className="flex flex-col items-center justify-center gap-0.5">
                                    <span className="bg-text-secondary h-1 w-1 rounded-full"></span>
                                    <span className="bg-text-secondary h-1 w-1 rounded-full"></span>
                                    <span className="bg-text-secondary h-1 w-1 rounded-full"></span>
                                </div>
                            </div>
                        </Button>
                    </TabList>

                    <Divider
                        id="search-tabs-h-divider"
                        aria-expanded={showSearchSettings}
                    />
                    <SettingBar visible={showSearchSettings} />
                    <Divider />

                    <TabContent
                        value="*"
                        className={`${maxHeight} overflow-hidden`}
                    >
                        <div className="flex flex-col gap-1">
                            {formattedResults?.bang}
                        </div>
                        <ScrollList
                            ref={listRef}
                            className={`${maxHeight}`}
                            selected={selectedKey}
                            setSelected={setSelectedKey}
                        >
                            {mergedFormattedResults}
                        </ScrollList>
                    </TabContent>
                    <TabContent value="files">
                        {formattedResults?.everything}
                    </TabContent>
                    <TabContent value="apps">
                        {formattedResults?.application}
                    </TabContent>
                    <TabContent value="settings">
                        {formattedResults?.controlPanel}
                    </TabContent>
                    <TabContent value="calculator">
                        <CalculatorResult />
                    </TabContent>
                </Tabs>
            </ContextMenuProvider>
        </Panel>
    )
}

export default ResultsContainer
